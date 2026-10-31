import { useNavigate } from "react-router-dom";

import { RefundJourney } from "@/components/concepts/refunds/100826/refund-journey";
import { RefundModalScreen } from "@/components/concepts/refunds/100826/refund-modal";
import { ROUTES } from "../pos-shell";
import { useActions } from "../store";

/**
 * **Refunds — V2**, the Oct 8 design, running.
 *
 * V1 has no refund flow: the shipping screens are transcribed under
 * **Flows / Refunds / Current state** and the redesign under **100826**, but
 * neither was reachable from the prototype until now.
 *
 * Option A was chosen on Oct 8 with Weston's notes applied — the Items/Amount
 * tabs gone, one total rather than three, Cancel reading Back, and **several
 * refunds against the same order**, each writing its own reversal rather than
 * editing the last.
 *
 * The journey keeps its own ledger per order, so two refunds taken in one
 * sitting do not contaminate each other. What this screen adds is the router:
 * the drawer now goes somewhere, which is the difference between the
 * documentation and a working application.
 */
export const RefundsScreen = () => {
    const navigate = useNavigate();
    const { signOut } = useActions();

    return (
        <RefundJourney
            renderModal={(props) => <RefundModalScreen {...props} />}
            onBack={() => navigate("/proshop")}
            onNavigate={(key) => {
                if (key === "logout") {
                    signOut();
                    navigate("/signin");
                    return;
                }
                navigate(ROUTES[key]);
            }}
        />
    );
};
