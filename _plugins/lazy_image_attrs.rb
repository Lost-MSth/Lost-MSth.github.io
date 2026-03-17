# frozen_string_literal: true

# Add lightweight defaults for post-content images.
# Keep behavior conservative: do not modify emoji images and do not overwrite existing attrs.
Jekyll::Hooks.register :documents, :post_render do |item|
  next unless item.output_ext == '.html'
  next unless item.respond_to?(:collection) && item.collection && item.collection.label == 'posts'

  content = item.output
  content.gsub!(%r{<img\b[^>]*>}i) do |tag|
    next tag if tag.match?(/\bclass\s*=\s*['"][^'"]*\bemoji\b[^'"]*['"]/i)

    updated = tag.dup
    updated = updated.sub(/\s*\/?\s*>\z/, ' loading="lazy"\0') unless updated.match?(/\bloading\s*=/i)
    updated = updated.sub(/\s*\/?\s*>\z/, ' decoding="async"\0') unless updated.match?(/\bdecoding\s*=/i)
    updated
  end

  item.output = content
end
