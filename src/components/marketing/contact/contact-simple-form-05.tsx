"use client";

import { useState } from "react";
import { MarkerPin02, MessageChatCircle, Phone } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Form } from "@/components/base/form/form";
import { Input, InputBase } from "@/components/base/input/input";
import { InputGroup } from "@/components/base/input/input-group";
import { NativeSelect } from "@/components/base/select/select-native";
import { TextArea } from "@/components/base/textarea/textarea";
import { Dribbble, Facebook, LinkedIn, X, YouTube } from "@/components/foundations/social-icons";
import countries, { phoneCodeOptions } from "@/utils/countries";

export const ContactSimpleForm05 = () => {
    const [selectedCountryPhone, setSelectedCountryPhone] = useState("US");

    return (
        <section className="grid min-h-screen grid-cols-1 bg-primary lg:grid-cols-[416px_1fr]">
            <div className="hidden bg-brand-section px-4 py-16 lg:block lg:p-12">
                <div className="mx-auto flex max-w-128 flex-col lg:h-full">
                    <h2 className="text-display-sm font-semibold text-primary_on-brand lg:text-display-xs">Get in touch</h2>
                    <p className="mt-4 text-lg text-tertiary_on-brand">We'd love to hear from you. Our friendly team is always here to chat.</p>
                    <ul className="mt-8 grid grid-cols-1 gap-8">
                        {[
                            {
                                title: "Chat to us",
                                subtitle: "Our friendly team is here to help.",
                                icon: MessageChatCircle,
                                cta: "hi@untitledui.com",
                                href: "mailto:hi@untitledui.com",
                            },
                            {
                                title: "Office",
                                subtitle: "Come say hello at our office HQ.",
                                cta: "100 Smith Street\nCollingwood VIC 3066 AU",
                                icon: MarkerPin02,
                                href: "https://goo.gl/maps/zTXmPKVdUvCQH9Wd6",
                            },
                            {
                                title: "Phone",
                                subtitle: "Mon-Fri from 8am to 5pm.",
                                icon: Phone,
                                cta: "+1 (555) 000-0000",
                                href: "tel:+1 (555) 000-0000",
                            },
                        ].map((item) => (
                            <li key={item.title} className="flex gap-4">
                                <item.icon className="mt-0.5 size-5 text-primary_on-brand md:size-6" />
                                <div className="flex flex-col items-start">
                                    <h3 className="text-lg font-semibold text-primary_on-brand">{item.title}</h3>
                                    <p className="mt-1 text-md text-tertiary_on-brand">{item.subtitle}</p>
                                    <Button color="link-color" size="lg" href={item.href} className="mt-4 whitespace-pre text-primary_on-brand md:mt-5">
                                        {item.cta}
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <ul className="mt-12 flex gap-8 lg:mt-auto">
                        {[
                            {
                                title: "Facebook",
                                icon: Facebook,
                                href: "#",
                            },
                            {
                                title: "X",
                                icon: X,
                                href: "#",
                            },
                            {
                                title: "LinkedIn",
                                icon: LinkedIn,
                                href: "#",
                            },
                            {
                                title: "YouTube",
                                icon: YouTube,
                                href: "#",
                            },
                            {
                                title: "Dribbble",
                                icon: Dribbble,
                                href: "#",
                            },
                        ].map(({ title, href, icon: Icon }) => (
                            <li key={title}>
                                <a
                                    href={href}
                                    className="rounded-xs text-icon-fg-brand_on-brand outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                                >
                                    <Icon size={24} aria-label={title} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex w-full px-4 py-16 md:items-center md:px-8 lg:py-24">
                <div className="mx-auto w-full md:max-w-120">
                    <h2 className="text-display-sm font-semibold text-primary md:text-display-md">Level up your brand</h2>
                    <p className="mt-4 text-lg whitespace-pre-line text-tertiary md:mt-5 md:text-xl">
                        You can reach us anytime via{" "}
                        <Button color="link-color" size="xl" href="mailto:hi@untitledui.com" className="text-lg font-medium md:text-xl">
                            hi@untitledui.com
                        </Button>
                    </p>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const data = Object.fromEntries(new FormData(e.currentTarget));
                            console.log("Form data:", data);
                        }}
                        className="mt-12 flex flex-col gap-8"
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-x-8 gap-y-6 sm:flex-row">
                                <Input isRequired size="lg" name="firstName" label="First name" placeholder="First name" wrapperClassName="flex-1" />
                                <Input isRequired size="lg" name="lastName" label="Last name" placeholder="Last name" wrapperClassName="flex-1" />
                            </div>

                            <Input isRequired size="lg" name="email" label="Email" type="email" placeholder="you@company.com" />
                            <InputGroup
                                size="lg"
                                name="phone"
                                label="Phone number"
                                leadingAddon={
                                    <NativeSelect
                                        aria-label="Country code"
                                        value={selectedCountryPhone}
                                        onChange={(value) => setSelectedCountryPhone(value.currentTarget.value)}
                                        options={phoneCodeOptions.map((item) => ({
                                            label: item.label as string,
                                            value: item.id as string,
                                        }))}
                                    />
                                }
                            >
                                <InputBase
                                    type="tel"
                                    placeholder={countries.find((country) => country.code === selectedCountryPhone)?.phoneMask?.replaceAll("#", "0")}
                                />
                            </InputGroup>
                            <TextArea isRequired name="message" label="Message" placeholder="Leave us a message..." rows={5} />
                            <fieldset className="max-md:hidden">
                                <legend className="text-sm font-medium text-secondary">Services</legend>
                                <div className="mt-4 grid grid-cols-1 gap-x-16 gap-y-4 sm:grid-cols-2">
                                    <Checkbox name="design" size="md" label="Website design" />
                                    <Checkbox name="content" size="md" label="Content creation" />
                                    <Checkbox name="ux" size="md" label="UX design" />
                                    <Checkbox name="consulting" size="md" label="Strategy & consulting" />
                                    <Checkbox name="research" size="md" label="User research" />
                                    <Checkbox name="other" size="md" label="Other" />
                                </div>
                            </fieldset>

                            <Checkbox
                                className="lg:hidden"
                                name="privacy"
                                size="md"
                                hint={
                                    <>
                                        You agree to our friendly{" "}
                                        <a
                                            href="#"
                                            className="rounded-xs underline underline-offset-3 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                                        >
                                            privacy policy.
                                        </a>
                                    </>
                                }
                            />
                        </div>

                        <Button type="submit" size="xl">
                            <span className="hidden lg:inline">Get started</span>
                            <span className="lg:hidden">Send message</span>
                        </Button>
                    </Form>
                </div>
            </div>
        </section>
    );
};
