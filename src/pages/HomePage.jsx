import React from 'react';
import {
  HeroSection,
  ServicesSection,
  NichesSection,
  WhyChooseUs,
  HowItWorks,
  CTASection,
} from '../components/home';

const HomePage = () => {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <NichesSection />
      <WhyChooseUs />
      <HowItWorks />
      <CTASection />
    </main>
  );
};

export default HomePage;
