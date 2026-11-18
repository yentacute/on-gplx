import { Ionicons } from '@expo/vector-icons';
import { type Href, Link } from 'expo-router';
import { Fragment, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { JsonLd } from '@/seo/JsonLd';
import { breadcrumbJsonLd, type Crumb } from '@/seo/structuredData';

const HOME_CRUMB: Crumb = { name: 'Trang chủ', path: '/' };

/** Visible breadcrumb trail plus its BreadcrumbList data. The last crumb is the current page. */
export const Breadcrumbs = ({ trail }: { trail: Crumb[] }) => {
  const crumbs = [HOME_CRUMB, ...trail];
  return (
    <View accessibilityRole="navigation" aria-label="Breadcrumb" className="flex-row flex-wrap items-center gap-1">
      <JsonLd data={JSON.stringify(breadcrumbJsonLd(crumbs))} />
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <Fragment key={c.path}>
            {i > 0 ? <Ionicons name="chevron-forward" size={12} color="#94a3b8" /> : null}
            {last ? (
              <Text className="text-xs text-slate-500" numberOfLines={1}>
                {c.name}
              </Text>
            ) : (
              <Link href={c.path as Href} className="text-xs font-medium text-primary">
                {c.name}
              </Link>
            )}
          </Fragment>
        );
      })}
    </View>
  );
};

type ContentPageProps = { trail: Crumb[]; jsonLd?: object[]; children: ReactNode };

/** Layout shared by the indexable content pages: breadcrumbs, structured data and a readable column. */
export const ContentPage = ({ trail, jsonLd = [], children }: ContentPageProps) => (
  <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="items-center p-3">
    <View className="w-full max-w-[720px] gap-3">
      <Breadcrumbs trail={trail} />
      {jsonLd.map((data, i) => (
        <JsonLd key={i} data={JSON.stringify(data)} />
      ))}
      {children}
    </View>
  </ScrollView>
);

export const PageHeading = ({ children }: { children: ReactNode }) => (
  <Text role="heading" aria-level={1} className="text-xl font-bold leading-7 text-slate-900">
    {children}
  </Text>
);

export const SectionHeading = ({ children }: { children: ReactNode }) => (
  <Text role="heading" aria-level={2} className="mt-2 text-base font-semibold text-slate-900">
    {children}
  </Text>
);

export const Card = ({ children }: { children: ReactNode }) => (
  <View className="gap-2 rounded-2xl border border-slate-200 bg-white p-4">{children}</View>
);

export const Paragraph = ({ children }: { children: ReactNode }) => (
  <Text className="text-sm leading-6 text-slate-700">{children}</Text>
);

/** Pill-shaped internal link. */
export const LinkChip = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href as Href} className="rounded-full bg-primary-light px-3 py-1.5 text-sm font-medium text-primary">
    {children}
  </Link>
);

export const LinkChips = ({ links }: { links: Crumb[] }) => (
  <View className="flex-row flex-wrap gap-2">
    {links.map((l) => (
      <LinkChip key={l.path} href={l.path}>
        {l.name}
      </LinkChip>
    ))}
  </View>
);

/** Full-width call to action that is a real link on web. */
export const ActionLink = ({ href, label, primary = false }: { href: Href; label: string; primary?: boolean }) => (
  <Link
    href={href}
    className={
      'flex-1 rounded-xl px-4 py-3 text-center text-sm font-semibold ' +
      (primary ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-800')
    }
  >
    {label}
  </Link>
);

/** Non-heading header title: these pages put their <h1> in the body. */
export const PlainHeaderTitle = ({ text }: { text: string }) => (
  <Text numberOfLines={1} className="text-[17px] font-semibold text-slate-900">
    {text}
  </Text>
);

export type NavItem = { title: string; subtitle?: string; path: string; badge?: string };

/** Tappable list of pages, one row each: title, optional subtitle and badge, chevron. Rows are real links on web. */
export const NavList = ({ items }: { items: NavItem[] }) => (
  <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    {items.map((item, i) => (
      <Link key={item.path} href={item.path as Href} asChild>
        <Pressable
          style={({ pressed }) => ({ backgroundColor: pressed ? '#f8fafc' : '#ffffff' })}
          className={'flex-row items-center gap-3 px-4 py-3 ' + (i === 0 ? '' : 'border-t border-slate-100')}
        >
          <View className="flex-1 gap-0.5">
            <Text className="text-[15px] font-semibold leading-5 text-slate-900">{item.title}</Text>
            {item.subtitle ? <Text className="text-[13px] text-slate-500">{item.subtitle}</Text> : null}
          </View>
          {item.badge ? (
            <View className="rounded-full bg-primary-light px-2.5 py-1">
              <Text className="text-xs font-bold text-primary">{item.badge}</Text>
            </View>
          ) : null}
          <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
        </Pressable>
      </Link>
    ))}
  </View>
);

/** Numbered step, for short how-to lists. */
export const Step = ({ n, children }: { n: number; children: ReactNode }) => (
  <View className="flex-row gap-3">
    <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-light">
      <Text className="text-xs font-bold text-primary">{n}</Text>
    </View>
    <Text className="flex-1 text-sm leading-6 text-slate-700">{children}</Text>
  </View>
);
