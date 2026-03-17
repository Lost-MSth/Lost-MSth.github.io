# frozen_string_literal: true

module LostBlogContentFeatures
  module_function

  MATH_PATTERNS = [
    /\$\$[\s\S]+?\$\$/m,
    /\$(?:[^$\n]|\\\$)+\$/,
    /\\\([\s\S]+?\\\)/m,
    /\\\[[\s\S]+?\\\]/m,
    /\\begin\{[a-zA-Z*]+\}/,
    /<script\s+type=["']math\/tex["']/i
  ].freeze

  def contains_math?(text)
    return false if text.nil? || text.empty?

    content = text.dup
    content.gsub!(/```[\s\S]*?```/, ' ')
    content.gsub!(/`[^`]*`/, ' ')

    MATH_PATTERNS.any? { |pattern| content.match?(pattern) }
  end

  def estimate_reading_time(text)
    return 1 if text.nil? || text.empty?

    content = text.dup
    content.gsub!(/```[\s\S]*?```/, ' ')
    content.gsub!(/`[^`]*`/, ' ')
    content.gsub!(/!\[[^\]]*\]\([^\)]*\)/, ' ')
    content.gsub!(/\[[^\]]*\]\([^\)]*\)/, ' ')
    content.gsub!(/<[^>]+>/, ' ')

    cjk_chars = content.scan(/\p{Han}|\p{Hiragana}|\p{Katakana}|\p{Hangul}/).length
    latin_words = content.scan(/[A-Za-z0-9_]+(?:['’-][A-Za-z0-9_]+)*/).length

    minutes = ((latin_words / 220.0) + (cjk_chars / 450.0)).ceil
    minutes < 1 ? 1 : minutes
  end
end

[:documents, :pages].each do |hook|
  Jekyll::Hooks.register hook, :pre_render do |item|
    raw_content = item.content.to_s

    if item.data['mathjax'].nil? && LostBlogContentFeatures.contains_math?(raw_content)
      item.data['mathjax'] = true
    end

    next unless item.respond_to?(:collection) && item.collection && item.collection.label == 'posts'
    next unless item.data['reading_time'].nil?

    item.data['reading_time'] = LostBlogContentFeatures.estimate_reading_time(raw_content)
  end
end
