"use client";

import { Mail01, MarkerPin02, MessageChatCircle, Phone } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";

export const ContactIconsAndForm = () => {
    return (
        <section className="bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="flex w-full max-w-xl flex-col sm:mx-auto lg:mx-0 lg:max-w-3xl">
                    <span className="text-sm font-semibold text-brand-secondary md:text-md">Contact us</span>
                    <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">Chat to our friendly team</h2>
                    <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">We'd love to hear from you. Please fill out this form or shoot us an email.</p>
                </div>

                <div className="mx-auto mt-12 grid max-w-xl grid-cols-1 items-start gap-12 md:mt-16 md:gap-16 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                    <ul className="grid w-full grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:gap-y-12">
                        {[
                            {
                                title: "Email",
                                subtitle: "Our friendly team is here to help.",
                                icon: Mail01,
                                cta: "hi@untitledui.com",
                                href: "mailto:hi@untitledui.com",
                            },
                            {
                                title: "Live chat",
                                subtitle: "Our friendly team is here to help.",
                                cta: "Start new chat",
                                icon: MessageChatCircle,
                                href: "#",
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
                            <li key={item.title} className="flex max-w-sm flex-col items-start">
                                <item.icon className="size-6 text-icon-fg-brand" />

                                <h3 className="mt-3 text-lg font-semibold text-primary md:mt-4 md:text-xl">{item.title}</h3>
                                <p className="mt-1 text-md text-tertiary md:mt-2">{item.subtitle}</p>
                                <Button href={item.href} color="link-color" size="lg" className="mt-3 whitespace-pre md:mt-4">
                                    {item.cta}
                                </Button>
                            </li>
                        ))}
                    </ul>

                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const data = Object.fromEntries(new FormData(e.currentTarget));
                            console.log("Form data:", data);
                        }}
                        className="flex flex-col gap-8 rounded-2xl sm:bg-secondary sm:px-8 sm:py-10"
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-x-8 gap-y-6 sm:flex-row">
                                <Input isRequired size="lg" name="firstName" label="First name" placeholder="First name" wrapperClassName="flex-1" />
                                <Input isRequired size="lg" name="lastName" label="Last name" placeholder="Last name" wrapperClassName="flex-1" />
                            </div>

                            <Input isRequired size="lg" name="email" label="Email" type="email" placeholder="you@company.com" />
                            <TextArea isRequired name="message" label="Message" placeholder="Leave us a message..." rows={5} />
                            <Checkbox
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
                            Send message
                        </Button>
                    </Form>
                </div>
            </div>
        </section>
    );
};
