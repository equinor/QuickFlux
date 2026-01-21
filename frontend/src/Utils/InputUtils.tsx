import { Icon, Tooltip } from "@equinor/eds-core-react";
import { styled } from "styled-components";
import { Icons } from "./Icons";

const StyledMeta = styled.div`
    display: flex;
`;

const StyledMetaText = styled.div`
    padding-right: 2px;
`;

export const ReplaceNotAllowedCharacters = (value: string) => {
    value = value.replace(/[=;()\[\]'"]/g, "");
    return value;
};

export const CreateMetaWithTooltip = (text: string, tooltip: string) => {
    if (text !== "")
        return (
            <StyledMeta>
                <StyledMetaText>{text}</StyledMetaText>
                <Tooltip title={tooltip} enterDelay={700} style={{ whiteSpace: "pre-wrap" }}>
                    <Icon name={Icons.InfoCircle} size={16} />
                </Tooltip>
            </StyledMeta>
        );

    return (
        <StyledMeta>
            <Tooltip title={tooltip} enterDelay={700} style={{ whiteSpace: "pre-wrap" }}>
                <Icon name={Icons.InfoCircle} size={16} />
            </Tooltip>
        </StyledMeta>
    );
};
