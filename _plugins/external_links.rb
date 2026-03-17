# frozen_string_literal: true

require 'uri'
require 'nokogiri'

module LostBlogExternalLinks
  module_function

  REL_TOKENS = %w[nofollow noopener noreferrer].freeze
  SKIP_SCHEMES = /\A(?:mailto:|tel:|javascript:|data:|about:|blob:)/i

  def class_tokens(node)
    node['class'].to_s.split(/\s+/).reject(&:empty?)
  end

  def add_class(node, token)
    classes = class_tokens(node)
    return if classes.include?(token)

    classes << token
    node['class'] = classes.join(' ')
  end

  def merge_rel(node)
    tokens = node['rel'].to_s.split(/\s+/).reject(&:empty?)
    REL_TOKENS.each do |token|
      tokens << token unless tokens.include?(token)
    end
    node['rel'] = tokens.join(' ')
  end

  def normalize_host_from_url(url)
    return nil if url.nil? || url.to_s.strip.empty?

    URI.parse(url.to_s).host
  rescue URI::InvalidURIError
    nil
  end

  def external_link?(href, internal_hosts)
    return false if href.nil?

    url = href.strip
    return false if url.empty?
    return false if url.start_with?('#', '/', './', '../')
    return false if url.match?(SKIP_SCHEMES)

    uri = begin
      if url.start_with?('//')
        URI.parse("https:#{url}")
      else
        URI.parse(url)
      end
    rescue URI::InvalidURIError
      return false
    end

    if uri.scheme.nil? && uri.host.nil?
      return false
    end

    return false unless %w[http https].include?(uri.scheme)

    host = uri.host.to_s.downcase
    return false if host.empty?

    !internal_hosts.include?(host)
  end

  def process_item(item)
    return unless item.output_ext == '.html'

    html = item.output.to_s
    return if html.empty?
    return unless html.include?('article__content')

    doc = Nokogiri::HTML::Document.parse(html)

    internal_hosts = ['localhost', '127.0.0.1']
    site_host = normalize_host_from_url(item.site.config['url'])
    internal_hosts << site_host if site_host
    internal_hosts = internal_hosts.compact.map(&:downcase).uniq

    doc.css('.article__content a[href]').each do |link|
      classes = class_tokens(link)
      next if classes.include?('button')
      next if link.at_css('img,svg,figure')

      href = link['href'].to_s
      next unless external_link?(href, internal_hosts)

      add_class(link, 'external-link')
      link['target'] = '_blank'
      merge_rel(link)
    end

    item.output = doc.to_html
  end
end

[:documents, :pages].each do |hook|
  Jekyll::Hooks.register hook, :post_render do |item|
    LostBlogExternalLinks.process_item(item)
  end
end
