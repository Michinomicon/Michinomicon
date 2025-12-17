"use client";
import React, { useEffect, useState } from "react";
import { useFormFields, useConfig, useField, Select } from "@payloadcms/ui";
import type { FieldClientComponent } from "payload";

export const FieldSelector: FieldClientComponent = (props) => {
    const { config } = useConfig();
    const path = props.path as string;
    const { value, setValue } = useField({ path });
    const [fieldOptions, setFieldOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);

    const slugDocId = useFormFields(([fields]) => {
        const pathParts = path.split(".");
        for (let i = pathParts.length - 2; i >= 0; i--) {
            const testPath = pathParts.slice(0, i + 1).join(".");
            const collectionSlugPath = `${testPath}.collectionSlug`;
            const fieldValue = fields[collectionSlugPath]?.value;
            if (fieldValue) return fieldValue;
        }
        return undefined;
    });

    useEffect(() => {
        if (!slugDocId || !config) {
            setFieldOptions([]);
            return;
        }

        setIsLoading(true);

        const fetchFields = async () => {
            try {
                const slugResponse = await fetch(`/api/slugs/${slugDocId}`);
                if (!slugResponse.ok) {
                    setFieldOptions([]);
                    setIsLoading(false);
                    return;
                }

                const slugDoc = await slugResponse.json();
                const slugString = slugDoc.slug || slugDoc.display;

                const collection = config.collections?.find(
                    (col) => col.slug === slugString
                );

                if (!collection) {
                    setFieldOptions([]);
                    setIsLoading(false);
                    return;
                }

                const extractFields = (fields: any[], prefix = ""): Array<{ label: string; value: string }> => {
                    const options: Array<{ label: string; value: string }> = [];

                    fields.forEach((field) => {
                        if (!field.name) return;

                        const fieldPath = prefix ? `${prefix}.${field.name}` : field.name;
                        const fieldLabel = field.label || field.name;

                        options.push({
                            label: prefix ? `${prefix} → ${fieldLabel}` : fieldLabel,
                            value: fieldPath,
                        });

                        if (field.type === "group" && field.fields) {
                            options.push(...extractFields(field.fields, fieldPath));
                        }
                        if (field.type === "array" && field.fields) {
                            options.push(...extractFields(field.fields, fieldPath));
                        }
                        if (field.type === "blocks" && field.blocks) {
                            field.blocks.forEach((block: any) => {
                                if (block.fields) {
                                    options.push(...extractFields(block.fields, `${fieldPath}.${block.slug}`));
                                }
                            });
                        }
                        if (field.type === "tabs" && field.tabs) {
                            field.tabs.forEach((tab: any) => {
                                if (tab.fields) {
                                    const tabPrefix = tab.name ? `${fieldPath}.${tab.name}` : fieldPath;
                                    options.push(...extractFields(tab.fields, tabPrefix));
                                }
                            });
                        }
                    });

                    return options;
                };

                const options = extractFields(collection.fields || []);
                setFieldOptions(options);
            } catch (error) {
                console.error("Error loading collection fields:", error);
                setFieldOptions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFields();
    }, [slugDocId, config]);

    return (
        <Select
            isMulti
            isClearable
            isDisabled={!slugDocId || isLoading}
            onChange={(selectedOptions) => {
                if (Array.isArray(selectedOptions)) {
                    setValue(selectedOptions.map((opt: any) => opt.value));
                } else {
                    setValue([]);
                }
            }}
            options={fieldOptions}
            value={
                Array.isArray(value)
                    ? fieldOptions.filter((opt) => value.includes(opt.value))
                    : []
            }
        />
    );
};
