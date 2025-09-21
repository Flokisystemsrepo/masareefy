import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Landing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const { t, isRTL } = useLanguage();

  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const pricingInView = useInView(pricingRef, { once: true });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div
      className={`min-h-screen bg-white overflow-hidden ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src="/masareefy-logo.png"
                alt="Masareefy Logo"
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-gray-900">Masareefy</span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {t("landing.footer.links.features")}
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {t("landing.footer.links.pricing")}
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {t("landing.footer.links.contact")}
              </a>
            </div>

            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <LanguageSwitcher />
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-blue-600"
                >
                  {t("navigation.login")}
                </Button>
              </Link>
              <Link to="/onboarding">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  {t("landing.hero.cta")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white"
          style={{ y, opacity }}
        />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {t("landing.hero.title")}
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t("landing.hero.subtitle")}
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
            >
              <Link to="/onboarding">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg group"
                >
                  {t("landing.hero.cta")}
                  <ArrowRight
                    className={`${
                      isRTL ? "mr-2" : "ml-2"
                    } w-5 h-5 group-hover:translate-x-1 transition-transform`}
                  />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
              >
                {t("landing.hero.learnMore")}
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 100 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Total Revenue
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      EGP 245,000
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      +12.5% this month
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Active Projects
                    </h3>
                    <p className="text-3xl font-bold text-gray-900">24</p>
                    <p className="text-sm text-blue-600 mt-1">
                      3 completed today
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Net Profit
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                      EGP 85,000
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      +8.2% this month
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("landing.features.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("landing.features.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: t("landing.features.financial.title"),
                description: t("landing.features.financial.description"),
                color: "blue",
              },
              {
                icon: Globe,
                title: t("landing.features.inventory.title"),
                description: t("landing.features.inventory.description"),
                color: "green",
              },
              {
                icon: Star,
                title: t("landing.features.analytics.title"),
                description: t("landing.features.analytics.description"),
                color: "purple",
              },
              {
                icon: Zap,
                title: t("landing.features.automation.title"),
                description: t("landing.features.automation.description"),
                color: "orange",
              },
              {
                icon: CheckCircle,
                title: t("landing.features.wallet.title"),
                description: t("landing.features.wallet.description"),
                color: "teal",
              },
              {
                icon: ArrowRight,
                title: t("landing.features.creative.title"),
                description: t("landing.features.creative.description"),
                color: "pink",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-${feature.color}-100 flex items-center justify-center mb-4`}
                >
                  <feature.icon
                    className={`w-6 h-6 text-${feature.color}-600`}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        ref={pricingRef}
        id="pricing"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={pricingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("landing.pricing.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("landing.pricing.subtitle")}
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                {t("landing.pricing.monthly")}
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === "yearly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                {t("landing.pricing.yearly")}
                <span
                  className={`${
                    isRTL ? "mr-2" : "ml-2"
                  } bg-green-500 text-white px-2 py-0.5 rounded-full text-xs`}
                >
                  {t("landing.pricing.save")}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {[
              {
                name: t("landing.pricing.free.name"),
                price: t("landing.pricing.free.price"),
                currency: t("landing.pricing.free.currency"),
                period: t("landing.pricing.free.period"),
                description: t("landing.pricing.free.description"),
                features: t("landing.pricing.free.features", {
                  returnObjects: true,
                }) as unknown as string[],
                cta: t("landing.pricing.free.cta"),
                free: true,
              },
              {
                name: t("landing.pricing.growth.name"),
                price: t("landing.pricing.growth.price"),
                currency: t("landing.pricing.growth.currency"),
                period: t("landing.pricing.growth.period"),
                description: t("landing.pricing.growth.description"),
                features: t("landing.pricing.growth.features", {
                  returnObjects: true,
                }) as unknown as string[],
                cta: t("landing.pricing.growth.cta"),
                popular: true,
                popularText: t("landing.pricing.growth.popular"),
              },
              {
                name: t("landing.pricing.scale.name"),
                price: t("landing.pricing.scale.price"),
                currency: t("landing.pricing.scale.currency"),
                period: t("landing.pricing.scale.period"),
                description: t("landing.pricing.scale.description"),
                features: t("landing.pricing.scale.features", {
                  returnObjects: true,
                }) as unknown as string[],
                cta: t("landing.pricing.scale.cta"),
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={`relative bg-white rounded-2xl border-2 p-8 flex flex-col h-full ${
                  plan.popular
                    ? "border-blue-600 shadow-lg scale-105"
                    : "border-gray-200 shadow-sm hover:shadow-md"
                } transition-all duration-300`}
                initial={{ opacity: 0, y: 50 }}
                animate={pricingInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {plan.popularText || "Most Popular"}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-center space-y-2">
                    {plan.free ? (
                      <span className="text-4xl font-bold text-gray-900">
                        Free
                      </span>
                    ) : (
                      <>
                        <div className="flex items-center justify-center">
                          <span
                            className={`text-sm text-gray-600 ${
                              isRTL ? "ml-1" : "mr-1"
                            }`}
                          >
                            {plan.currency || "EGP"}
                          </span>
                          <span className="text-4xl font-bold text-gray-900">
                            {billingCycle === "monthly"
                              ? plan.price
                              : (parseInt(plan.price) * 10).toLocaleString()}
                          </span>
                          <span
                            className={`text-gray-600 ${
                              isRTL ? "mr-1" : "ml-1"
                            }`}
                          >
                            {plan.period ||
                              `/${
                                billingCycle === "monthly" ? "month" : "year"
                              }`}
                          </span>
                        </div>
                        {billingCycle === "yearly" && (
                          <div className="text-sm text-green-600">
                            EGP{" "}
                            {Math.round(
                              (parseInt(plan.price) * 10) / 12
                            ).toLocaleString()}
                            /month
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Link to="/onboarding">
                    <Button
                      className={`w-full h-12 text-base font-semibold ${
                        plan.free
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : plan.popular
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      }`}
                    >
                      {plan.free ? "Start Free" : plan.cta || "Get Started"}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("landing.cta.title")}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t("landing.cta.subtitle")}
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              {t("landing.cta.button")}
              <ArrowRight className={`${isRTL ? "mr-2" : "ml-2"} w-5 h-5`} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold">Masareefy</span>
              </div>
              <p className="text-gray-400">{t("landing.footer.description")}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">
                {t("landing.footer.product")}
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.features")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.pricing")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.integrations")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.api")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">
                {t("landing.footer.company")}
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.about")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.blog")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.careers")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.contact")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">
                {t("landing.footer.support")}
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.help")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.documentation")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.status")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("landing.footer.links.privacy")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
