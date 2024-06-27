import styled, { useTheme, keyframes } from "styled-components";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";

import { useYeeter } from "../hooks/useYeeter";
import { DEFAULT_CHAIN_ID } from "../utils/constants";
import { YeeterItem } from "../utils/types";
import {
  Badge,
  Button,
  Card,
  DataLg,
  DataXs,
  ParLg,
  ParMd,
  ParXl,
} from "@daohaus/ui";

import CoinPile from "../assets/coin-pile-trans.png";
import { formatValueTo, fromWei } from "@daohaus/utils";
import {
  calcPercToGoal,
  formatTimeRemainingShort,
  formatTimeUntilPresale,
  getCampaignStatus,
} from "../utils/yeetDataHelpers";

import { ButtonRouterLink } from "./ButtonRouterLink";
import BuyButton from "./BuyButton";
import { StatusFlag } from "./StatusFlag";
import { useDaoMember } from "@daohaus/moloch-v3-hooks";
import { ValidNetwork } from "@daohaus/keychain-utils";
import { useDHConnect } from "@daohaus/connect";
import { useMarketMaker } from "../hooks/useMarketMaker";
import ExitButton from "./ExitButton";
import SwapButton from "./SwapButton";
import { useDaoData } from "../hooks/useDaoData";

const tiltShaking = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
`;

const SpacedCard = styled(Card)`
  margin-right: 1rem;
  width: 35rem;

  .tilt-shake {
    animation: ${tiltShaking} 0.3s infinite;
  }
`;

const TopSectionContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const DataCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  .detailsLink {
    margin-top: 2rem;
  }
`;

const TokenNameParXl = styled(ParXl)`
  font-size: 4.5rem;
  line-height: normal;
  margin-bottom: -0.5rem;
`;

const TimeDataLg = styled(DataLg)`
  font-weight: 700;
  line-height: 1;
  margin: 2rem 0;
  text-align: center;
  background-color: ${(props) => props.theme.warning.step10};
  color: black;
  padding: 1rem;
`;

export const YeeterListCard = ({ yeeterData }: { yeeterData: YeeterItem }) => {
  const { address, chainId } = useDHConnect();

  const { metadata, yeeter } = useYeeter({
    daoId: yeeterData.dao.id,
    shamanAddress: yeeterData.id,
    chainId: chainId,
    yeeterData,
  });
  const theme = useTheme();

  const { dao } = useDaoData({
    daoId: yeeterData.dao.id,
    daoChain: chainId as ValidNetwork,
  });
  const { member } = useDaoMember({
    daoChain: chainId as ValidNetwork,
    daoId: yeeterData.dao.id,
    memberAddress: address,
  });

  const { canExecute, executed, goalAchieved } = useMarketMaker({
    daoId: yeeterData.dao.id,
    yeeterShamanAddress: yeeterData.id,
    chainId: chainId,
    daoShamans: dao?.shamen?.map((s) => s.shamanAddress),
  });

  if (!metadata || !yeeter) return null;

  const campaignStatus = getCampaignStatus(
    yeeter,
    executed || false,
    canExecute || false,
    goalAchieved || false
  );

  const hasRumble = yeeter.isComingSoon || yeeter.isEndingSoon || yeeter.isNew;

  return (
    <SpacedCard>
      <TopSectionContainer className={hasRumble ? "tilt-shake" : ""}>
        {metadata.avatarImg && metadata.avatarImg !== "" ? (
          <img src={metadata.avatarImg} height="100px" />
        ) : (
          <img src={CoinPile} height="100px" />
        )}
      </TopSectionContainer>
      <DataCol>
        <TokenNameParXl>{yeeter.dao.shareTokenSymbol}</TokenNameParXl>
        <DataXs>{metadata.name}</DataXs>

        {yeeter.isActive && (
          <TimeDataLg color={theme.warning.step10}>
            Presale Ends {formatTimeRemainingShort(yeeter)}
          </TimeDataLg>
        )}

        {yeeter.isComingSoon && (
          <TimeDataLg color={theme.success.step10}>
            Presale Starts {formatTimeUntilPresale(yeeter)}
          </TimeDataLg>
        )}

        <StatusFlag yeeter={yeeter} />

        {yeeter.isActive && (
          <>
            <ParMd>
              {`${formatValueTo({
                value: fromWei(yeeter.safeBalance.toString()),
                decimals: 5,
                format: "number",
              })} ETH Raised`}
            </ParMd>
            <ParMd>{calcPercToGoal(yeeter)}</ParMd>
          </>
        )}

        {yeeter.isEnded && (
          <>
            {campaignStatus == "SUCCESS" ? (
              <ParMd>Reached Goal</ParMd>
            ) : (
              <ParMd>
                {`${formatValueTo({
                  value: fromWei(yeeter.safeBalance.toString()),
                  decimals: 5,
                  format: "number",
                })} ETH Raised`}
              </ParMd>
            )}
            <ParLg>{campaignStatus}</ParLg>
          </>
        )}

        {yeeter.isActive && (
          <BuyButton
            daoChain={chainId as ValidNetwork}
            daoId={yeeter.dao.id}
            yeeterId={yeeter.id}
            metadata={metadata}
          />
        )}

        {campaignStatus == "SUCCESS" && (
          <SwapButton
            daoChain={chainId as ValidNetwork}
            daoId={yeeter.dao.id}
            yeeterId={yeeter.id}
          />
        )}
        {campaignStatus == "SUCCESS" && Number(member?.shares) > 0 && (
          <ExitButton
            daoChain={chainId as ValidNetwork}
            yeeterId={yeeter.id}
            daoId={yeeter.dao.id}
          />
        )}

        <div className="detailsLink">
          <ButtonRouterLink
            to={`molochv3/${chainId}/${yeeter.dao.id}/${yeeter.id}`}
          >
            <ParMd>What is this?</ParMd>
            <HiOutlineArrowNarrowRight />
          </ButtonRouterLink>
        </div>
      </DataCol>
    </SpacedCard>
  );
};
