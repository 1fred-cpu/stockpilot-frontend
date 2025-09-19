"use client";
import React from "react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
};
export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section>
      <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
        {subtitle}
      </p>
    </section>
  );
}
