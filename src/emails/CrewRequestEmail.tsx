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

interface CrewRequestEmailProps {
  senderName: string;
  message?: string;
  appUrl: string;
}

export const CrewRequestEmail = ({
  senderName = "A friend",
  message,
  appUrl = "https://recdclub.in",
}: CrewRequestEmailProps) => {
  const previewText = `${senderName} wants to add you to their Crew!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#0f0f0f] font-sans my-auto mx-auto p-4">
          <Container className="border border-solid border-[#ffffff1a] rounded-[24px] overflow-hidden my-[40px] mx-auto w-[465px] max-w-full bg-[#1a1a1a]">
            {/* Header / Brand */}
            <Section className="bg-[#ea3333] px-8 py-6 text-center">
              <Img 
                src={`${appUrl}/icon.png`} 
                alt="Rec'd Club" 
                width="40" 
                height="40" 
                className="mx-auto rounded-[8px]" 
              />
            </Section>

            <Section className="px-8 py-8 text-center">
              <Heading className="text-[#f5f5f0] text-[24px] font-bold m-0 mb-6 font-serif">
                New Crew Request
              </Heading>
              
              <Text className="text-[#f5f5f0b3] text-[15px] leading-[24px] mb-8">
                <strong className="text-white">{senderName}</strong> wants to connect with you on Rec'd Club. Connect your crews to share watchlists and taste scores!
              </Text>

              {message && (
                <Section className="bg-[#00000040] rounded-xl p-4 mb-8 border border-[#ffffff0d]">
                  <Text className="text-[#f5f5f0b3] text-[14px] italic m-0">
                    "{message}"
                  </Text>
                </Section>
              )}

              <Section className="mt-8 mb-4">
                <Button
                  className="bg-[#ea3333] rounded-xl text-white text-[12px] font-black tracking-[0.2em] uppercase no-underline px-8 py-4"
                  href={`${appUrl}/profile`}
                >
                  View Pending Requests
                </Button>
              </Section>
            </Section>
            
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

export default CrewRequestEmail;
