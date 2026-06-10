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

interface GroupRecommendationEmailProps {
  senderName: string;
  titleName: string;
  groupName: string;
  posterUrl?: string;
  message?: string;
  appUrl: string;
}

export const GroupRecommendationEmail = ({
  senderName = "A friend",
  titleName = "a movie",
  groupName = "your group",
  posterUrl,
  message,
  appUrl = "https://recdclub.in",
}: GroupRecommendationEmailProps) => {
  const previewText = `${senderName} dropped a rec in ${groupName}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#0f0f0f] font-sans my-auto mx-auto p-4">
          <Container className="border border-solid border-[#ffffff1a] rounded-[24px] overflow-hidden my-[40px] mx-auto w-[465px] max-w-full bg-[#1a1a1a]">
            {/* Header / Brand */}
            <Section className="bg-[#ea3333] px-8 py-6 text-center">
              <Text className="text-white text-[12px] font-black tracking-[0.3em] uppercase m-0">
                Rec'd Club
              </Text>
            </Section>

            {/* Content */}
            <Section className="px-8 py-8">
              <Heading className="text-[#f5f5f0] text-[24px] font-bold text-center my-0 mb-6 font-serif">
                New Group Drop!
              </Heading>
              
              <Text className="text-[#f5f5f0b3] text-[15px] leading-[24px] text-center mb-8">
                <strong className="text-[#ea3333]">{senderName}</strong> just recommended <strong className="text-white">{titleName}</strong> to <strong className="text-white">{groupName}</strong>.
              </Text>

              {posterUrl && (
                <Section className="text-center mb-8">
                  <Img 
                    src={posterUrl} 
                    alt={titleName} 
                    width="140" 
                    className="mx-auto rounded-xl shadow-2xl border-2 border-[#ffffff1a]" 
                  />
                </Section>
              )}

              {message && (
                <Section className="bg-[#00000040] rounded-xl p-4 mb-8 border border-[#ffffff0d]">
                  <Text className="text-[#f5f5f0b3] text-[14px] italic m-0 text-center">
                    "{message}"
                  </Text>
                </Section>
              )}

              <Section className="text-center mt-8 mb-4">
                <Button
                  className="bg-[#ea3333] rounded-xl text-white text-[12px] font-black tracking-[0.2em] uppercase no-underline text-center px-8 py-4"
                  href={`${appUrl}/groups`}
                >
                  View Group
                </Button>
              </Section>
            </Section>
            
            {/* Footer */}
            <Section className="px-8 py-6 bg-[#0a0a0a] border-t border-[#ffffff0d]">
              <Text className="text-[#f5f5f066] text-[12px] leading-[20px] text-center m-0">
                You received this email because you're a member of Rec'd Club.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default GroupRecommendationEmail;
