"use client";

import React from 'react';
import ArticleGate from './ArticleGate';

interface ArticleContentProps {
  slug: string;
  title: string;
  content: string;
  excerpt?: string | null;
}

export default function ArticleContent({ slug, title, content, excerpt }: ArticleContentProps) {
  // Create a preview from the first few paragraphs
  const createPreview = () => {
    // Get content up to ~500 characters or first 2 paragraphs
    const parser = typeof window !== 'undefined' ? new DOMParser() : null;
    if (!parser) return null;
    
    const doc = parser.parseFromString(content, 'text/html');
    const elements = doc.body.querySelectorAll('p, h2, h3, ul, ol, blockquote');
    
    let previewHtml = '';
    let charCount = 0;
    const maxChars = 600;
    
    for (let i = 0; i < elements.length && charCount < maxChars; i++) {
      const el = elements[i];
      previewHtml += el.outerHTML;
      charCount += el.textContent?.length || 0;
    }
    
    return previewHtml;
  };

  const previewContent = createPreview();

  return (
    <ArticleGate
      articleSlug={slug}
      articleTitle={title}
      preview={
        previewContent ? (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        ) : (
          excerpt ? (
            <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">{excerpt}</p>
          ) : null
        )
      }
    >
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </ArticleGate>
  );
}
