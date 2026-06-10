import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userName?: string;
  appUrl: string;
}

export const WelcomeEmail = ({
  userName = "Movie Lover",
  appUrl = "https://recdclub.in",
}: WelcomeEmailProps) => {
  const previewText = `Welcome to Rec'd Club, ${userName}! Your cinematic journey begins now.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#0f0f0f] font-sans my-auto mx-auto p-4">
          <Container className="border border-solid border-[#ffffff1a] rounded-[24px] overflow-hidden my-[40px] mx-auto w-[465px] max-w-full bg-[#1a1a1a]">
            {/* Header / Brand */}
            <Section className="bg-[#0a0a0a] px-8 py-6 text-center border-b border-[#ffffff1a]">
              <Heading className="text-white text-[24px] font-serif font-bold tracking-tight m-0">
                Rec<span className="text-[#ea3333]">'</span>d Club
              </Heading>
            </Section>

            {/* Content */}
            <Section className="px-8 py-8">
              <Heading className="text-[#f5f5f0] text-[24px] font-bold text-center my-0 mb-6 font-serif">
                Welcome to the Club!
              </Heading>
              
              <Text className="text-[#f5f5f0b3] text-[15px] leading-[24px] text-center mb-6">
                Hey <strong className="text-white">{userName}</strong>, we're incredibly excited to have you join Rec'd Club!
              </Text>

              <Text className="text-[#f5f5f0b3] text-[15px] leading-[24px] text-center mb-8">
                You've successfully completed your onboarding. You can now build your watchlist, join groups, and share your favorite films with your crew.
              </Text>

              <Section className="text-center mt-8 mb-4">
                <Button
                  className="bg-[#ea3333] rounded-xl text-white text-[12px] font-black tracking-[0.2em] uppercase no-underline text-center px-8 py-4"
                  href={`${appUrl}/home`}
                >
                  Start Exploring
                </Button>
              </Section>
            </Section>
            
            {/* Footer */}
            <Section className="px-8 py-6 bg-[#0a0a0a] border-t border-[#ffffff0d]">
              <Text className="text-[#f5f5f066] text-[12px] leading-[20px] text-center m-0">
                You received this email because you signed up for Rec'd Club.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
