import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/api";
import SectionRenderer from "@/components/SectionRenderer";
import type { AcfSection } from "@/types/acf";


export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const page = await getPageBySlug(slugPath);

  if (!page) {
    return {
      title: "Page Not Found | Épure Atelier",
    };
  }

  return {
    title: `${page.title?.rendered || "Page"} | Épure Atelier`,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  const page = await getPageBySlug(slugPath);

  if (!page) {
    notFound();
  }

  const rawSections =
    page.custom_sections ||
    page.acf?.sections ||
    page.sections ||
    [];

  const hasSections = Array.isArray(rawSections) && rawSections.length > 0;

  return (
    <article className="w-full flex flex-col">
      {/* If ACF sections exist, render them */}
      {hasSections ? (
        <SectionRenderer sections={rawSections as AcfSection[]} />
      ) : (
        /* Fallback for regular WordPress pages without ACF flexible content */
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24 w-full">
          <header className="mb-8 pb-4 border-b border-[#d5c3be]/40">
            <h1
              className="text-3xl md:text-5xl font-serif text-[#1b1c19]"
              dangerouslySetInnerHTML={{ __html: page.title?.rendered || "" }}
            />
          </header>

          {page.content?.rendered && (
            <div
              className="prose prose-stone max-w-none text-[#514440] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.content.rendered }}
            />
          )}
        </div>
      )}
    </article>
  );
}
