"use client";

interface NewsContentProps {
  html: string;
}

export default function NewsContent({ html }: NewsContentProps) {
  return (
    <div
      className="prose dark:prose-invert max-w-none
        prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 dark:prose-strong:text-gray-100
        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700
        prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
        prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5
        prose-li:text-gray-700 dark:prose-li:text-gray-300
        prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
        prose-table:w-full prose-table:text-sm prose-table:border-collapse
        prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-th:p-2 prose-th:bg-gray-50 dark:prose-th:bg-gray-800
        prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:p-2
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
