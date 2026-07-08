"use client";

import { ChevronRight } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";

const footerNavList = [
    {
        label: "Product",
        items: [
            {
                label: "Overview",
                href: "#",
            },
            {
                label: "Features",
                href: "#",
            },
            {
                label: "Solutions",
                href: "#",
                badge: (
                    <Badge color="gray" type="modern" size="sm" className="ml-1">
                        New
                    </Badge>
                ),
            },
            {
                label: "Tutorials",
                href: "#",
            },
            {
                label: "Pricing",
                href: "#",
            },
            {
                label: "Releases",
                href: "#",
            },
        ],
    },
    {
        label: "Company",
        items: [
            {
                label: "About us",
                href: "#",
            },
            {
                label: "Careers",
                href: "#",
            },
            {
                label: "Press",
                href: "#",
            },
            {
                label: "News",
                href: "#",
            },
            {
                label: "Media kit",
                href: "#",
            },
            {
                label: "Contact",
                href: "#",
            },
        ],
    },
    {
        label: "Resources",
        items: [
            {
                label: "Blog",
                href: "#",
            },
            {
                label: "Newsletter",
                href: "#",
            },
            {
                label: "Events",
                href: "#",
            },
            {
                label: "Help centre",
                href: "#",
            },
            {
                label: "Tutorials",
                href: "#",
            },
            {
                label: "Support",
                href: "#",
            },
        ],
    },
    {
        label: "Use cases",
        items: [
            {
                label: "Startups",
                href: "#",
            },
            {
                label: "Enterprise",
                href: "#",
            },
            {
                label: "Government",
                href: "#",
            },
            {
                label: "SaaS centre",
                href: "#",
            },
            {
                label: "Marketplaces",
                href: "#",
            },
            {
                label: "Ecommerce",
                href: "#",
            },
        ],
    },
    {
        label: "Social",
        items: [
            {
                label: "X",
                href: "#",
            },
            {
                label: "LinkedIn",
                href: "#",
            },
            {
                label: "Facebook",
                href: "#",
            },
            {
                label: "GitHub",
                href: "#",
            },
            {
                label: "AngelList",
                href: "#",
            },
            {
                label: "Dribbble",
                href: "#",
            },
        ],
    },
    {
        label: "Legal",
        items: [
            {
                label: "Terms",
                href: "#",
            },
            {
                label: "Privacy",
                href: "#",
            },
            {
                label: "Cookies",
                href: "#",
            },
            {
                label: "Licenses",
                href: "#",
            },
            {
                label: "Settings",
                href: "#",
            },
            {
                label: "Contact",
                href: "#",
            },
        ],
    },
];

const socialProofAvatars = [
    { src: "https://www.untitledui.com/logos/images/Kintsugi.jpg", alt: "Kintsugi" },
    { src: "https://www.untitledui.com/logos/images/Refractional.jpg", alt: "Refractional" },
    { src: "https://www.untitledui.com/logos/images/Leapyear.jpg", alt: "Leapyear" },
    { src: "https://www.untitledui.com/logos/images/ContrastAI.jpg", alt: "ContrastAI" },
];

const FooterSocialProofBadge = () => (
    <a
        href="#"
        className="flex w-max items-center gap-3 rounded-full bg-primary_alt py-1.5 pr-2 pl-1.5 shadow-xs ring-1 ring-secondary_alt transition duration-100 ease-linear hover:bg-primary_hover"
    >
        <div className="flex items-start">
            {socialProofAvatars.map((avatar, i) => (
                <img
                    key={i}
                    src={avatar.src}
                    alt={avatar.alt}
                    className="-ml-1 size-6 rounded-full object-cover ring-[1.5px] ring-white outline-[0.5px] -outline-offset-[0.5px] outline-black/16 first:ml-0"
                />
            ))}
        </div>
        <hr className="h-4 w-px rounded-full border-none bg-border-secondary" />
        <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-primary">Join 2,000+ companies</p>
            <ChevronRight className="size-4 text-fg-quaternary" />
        </div>
    </a>
);

export const FooterLarge05 = () => {
    return (
        <footer className="bg-primary py-12 md:pt-16">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="flex flex-col items-start justify-between gap-8 border-secondary md:flex-row md:border-b md:pb-16">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <p id="newsletter-label" className="text-lg font-semibold text-primary md:text-xl">
                                Join our newsletter
                            </p>
                            <p id="newsletter-hint" className="text-md text-tertiary">
                                We'll send you a nice letter once per week. No spam.
                            </p>
                        </div>
                        <FooterSocialProofBadge />
                    </div>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const data = Object.fromEntries(new FormData(e.currentTarget));
                            console.log("Form data:", data);
                        }}
                        className="w-full sm:w-100"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Input
                                isRequired
                                aria-labelledby="newsletter-label"
                                aria-describedby="newsletter-hint"
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                size="lg"
                                wrapperClassName="flex-1"
                            />
                            <Button type="submit" size="lg">
                                Subscribe
                            </Button>
                        </div>
                    </Form>
                </div>

                <nav className="mt-12 md:mt-16">
                    <ul className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
                        {footerNavList.map((category) => (
                            <li key={category.label}>
                                <h4 className="text-sm font-semibold text-quaternary">{category.label}</h4>
                                <ul className="mt-4 flex flex-col gap-3">
                                    {category.items.map((item) => (
                                        <li key={item.label} className="flex">
                                            <Button color="link-gray" size="md" href={item.href} iconTrailing={item.badge} className="max-h-5 gap-1">
                                                {item.label}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="mt-12 flex flex-col justify-between gap-6 border-t border-secondary pt-8 md:mt-16 md:flex-row md:items-center">
                    <UntitledLogo className="h-7 w-min" />
                    <p className="text-sm text-quaternary">© 2077 Untitled UI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
