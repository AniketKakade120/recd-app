import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface VerdictEmailProps {
  reviewerName: string;
  titleName: string;
  verdictLabel: string;
  verdictScore: number;
  appUrl: string;
}

export const VerdictEmail = ({
  reviewerName = "A friend",
  titleName = "a movie",
  verdictLabel = "Nailed It",
  verdictScore = 100,
  appUrl = "https://recdclub.in",
}: VerdictEmailProps) => {
  const previewText = `${reviewerName} just rated your recommendation!`;
  
  // Decide color based on score
  const scoreColor = verdictScore > 75 ? '#ea3333' : verdictScore > 40 ? '#f5f5f0' : '#f5f5f066';

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

            {/* Content */}
            <Section className="px-8 py-8">
              <Heading className="text-[#f5f5f0] text-[24px] font-bold text-center my-0 mb-6 font-serif">
                The Verdict is In!
              </Heading>
              
              <Text className="text-[#f5f5f0b3] text-[15px] leading-[24px] text-center mb-8">
                <strong className="text-white">{reviewerName}</strong> just watched <strong className="text-white">{titleName}</strong> based on your recommendation.
              </Text>

              <Section className="bg-[#00000040] rounded-[24px] p-6 mb-8 border border-[#ffffff0d] text-center">
                <Text className="text-[#f5f5f066] text-[10px] font-black tracking-[0.2em] uppercase m-0 mb-2">
                  Their Verdict
                </Text>
                <Text className="text-[32px] font-bold m-0 font-serif" style={{ color: scoreColor }}>
                  "{verdictLabel}"
                </Text>
              </Section>

              <Text className="text-[#f5f5f0b3] text-[14px] leading-[24px] text-center mb-8">
                Your Taste Score has been updated! Keep dropping great recommendations to climb the leaderboard.
              </Text>

              <Section className="text-center mt-8 mb-4">
                <Button
                  className="bg-[#ea3333] rounded-xl text-white text-[12px] font-black tracking-[0.2em] uppercase no-underline text-center px-8 py-4"
                  href={`${appUrl}/profile`}
                >
                  Check Your Taste Score
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

export default VerdictEmail;
