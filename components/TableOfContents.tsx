"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Parse HTML to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const headings = doc.querySelectorAll("h2, h3, h4");

    const items: TocItem[] = Array.from(headings).map((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || "";
      const id = `heading-${index}`;

      // Add ID to heading in actual content
      heading.setAttribute("id", id);

      return { id, text, level };
    });

    setToc(items);

    // Inject IDs back into the actual DOM
    const articleContent = document.querySelector(".prose");
    if (articleContent) {
      const actualHeadings = articleContent.querySelectorAll("h2, h3, h4");
      actualHeadings.forEach((heading, index) => {
        heading.setAttribute("id", `heading-${index}`);
      });
    }
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    toc.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length < 3) return null; // Only show TOC if there are at least 3 headings

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="hidden lg:block">
      <div className="sticky top-24 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b">
          <List size={20} className="text-gray-600" />
          <h3 className="font-bold text-gray-900">Table of Contents</h3>
        </div>
        <nav>
          <ul className="space-y-2">
            {toc.map((item) => (
              <li
                key={item.id}
                style={{ paddingLeft: `${(item.level - 2) * 1}rem` }}
              >
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`text-left text-sm hover:text-blue-600 transition-colors ${
                    activeId === item.id
                      ? "text-blue-600 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
