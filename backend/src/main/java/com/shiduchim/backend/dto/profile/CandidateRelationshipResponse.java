package com.shiduchim.backend.dto.profile;

import com.shiduchim.backend.enums.AllowedCandidateAction;
import com.shiduchim.backend.enums.CandidateOutgoingAction;

import java.util.List;

public class CandidateRelationshipResponse {
    private CandidateOutgoingAction outgoingAction;
    private Boolean incomingLike;
    private CandidateOpeningSummaryResponse opening;
    private CandidateMatchSummaryResponse match;
    private CandidateEffectiveContextResponse effectiveContext;
    private List<AllowedCandidateAction> allowedActions;

    public CandidateRelationshipResponse() {}

    public CandidateOutgoingAction getOutgoingAction() { return outgoingAction; }
    public void setOutgoingAction(CandidateOutgoingAction outgoingAction) { this.outgoingAction = outgoingAction; }

    public Boolean getIncomingLike() { return incomingLike; }
    public void setIncomingLike(Boolean incomingLike) { this.incomingLike = incomingLike; }

    public CandidateOpeningSummaryResponse getOpening() { return opening; }
    public void setOpening(CandidateOpeningSummaryResponse opening) { this.opening = opening; }

    public CandidateMatchSummaryResponse getMatch() { return match; }
    public void setMatch(CandidateMatchSummaryResponse match) { this.match = match; }

    public CandidateEffectiveContextResponse getEffectiveContext() { return effectiveContext; }
    public void setEffectiveContext(CandidateEffectiveContextResponse effectiveContext) { this.effectiveContext = effectiveContext; }

    public List<AllowedCandidateAction> getAllowedActions() { return allowedActions; }
    public void setAllowedActions(List<AllowedCandidateAction> allowedActions) { this.allowedActions = allowedActions; }
}
