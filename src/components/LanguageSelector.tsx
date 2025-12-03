import React from "react";
import { useTranslation } from "react-i18next";
import Dropdown, { DropdownOption } from "./Dropdown";
import { Globe } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

interface LanguageSelectorProps {
  value?: string;
  onChange?: (languageCode: string) => void;
  currentLanguage?: string;
  onLanguageChange?: (languageCode: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  currentLanguage,
  onLanguageChange,
}) => {
  const { i18n, t } = useTranslation();
  const { currentLanguage: contextLanguage, setLanguage } = useLanguage();

  const languages = [
    { code: "en", name: t("language.en") },
    { code: "es", name: t("language.es") },
    { code: "de", name: t("language.de") },
    { code: "fr", name: t("language.fr") },
    { code: "it", name: t("language.it") },
    { code: "pt", name: t("language.pt") },
  ];

  const options: DropdownOption[] = languages.map((lang) => ({
    value: lang.code,
    label: lang.name,
  }));

  const handleLanguageChange = (option: DropdownOption) => {
    if (onChange) {
      onChange(option.value);
    } else if (onLanguageChange) {
      onLanguageChange(option.value);
    } else {
      setLanguage(option.value);
    }
  };

  const normalize = (lang: string) => lang.split("-")[0];
  const selectedLanguage = value
    ? normalize(value)
    : normalize(currentLanguage || contextLanguage || i18n.language);

  return (
    <Dropdown
      options={options}
      value={selectedLanguage}
      onChange={handleLanguageChange}
      icon={<Globe size={20} className="text-blue-500" />}
      className="min-w-[140px]"
    />
  );
};

export default LanguageSelector;
