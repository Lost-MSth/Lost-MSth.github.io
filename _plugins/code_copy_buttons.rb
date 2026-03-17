# frozen_string_literal: true

require 'nokogiri'

module LostBlogCodeCopyButtons
  module_function

  def class_tokens(node)
    node['class'].to_s.split(/\s+/).reject(&:empty?)
  end

  def has_class?(node, name)
    class_tokens(node).include?(name)
  end

  def process_item(item)
    return unless item.output_ext == '.html'

    html = item.output.to_s
    return if html.empty?
    return unless html.include?('js-article-content') && html.include?('highlight')

    doc = Nokogiri::HTML::Document.parse(html)

    doc.css('.js-article-content .highlight').each do |highlight|
      next if highlight.ancestors.any? { |a| has_class?(a, 'highlight') }

      unless highlight['data-lang']
        code = highlight.at_css('code[data-lang]')
        lang = code && code['data-lang']
        highlight['data-lang'] = lang if lang && !lang.empty?
      end

      next if highlight.at_css('.js-code-copy')

      button = Nokogiri::XML::Node.new('button', doc)
      button['type'] = 'button'
      button['class'] = 'code-copy-btn js-code-copy'
      button['aria-label'] = 'Copy code'
      button.content = 'Copy'
      highlight.add_child(button)
    end

    item.output = doc.to_html
  end
end

[:documents, :pages].each do |hook|
  Jekyll::Hooks.register hook, :post_render do |item|
    LostBlogCodeCopyButtons.process_item(item)
  end
end
