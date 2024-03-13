import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  useSubscription,
  useExtensionCapability,
  useBuyerJourney,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const { shippingAddress } = useApi();
  const customerData = useSubscription(shippingAddress);
  const canBlockProgress = useExtensionCapability("block_progress");
  const [validationError, setValidationError] = useState("");
  const translate = useTranslate();
  const { extension } = useApi();

  let areaStatus;
  let infoText;
  let title;
  function isPhoneCorrect() {
    if (customerData.phone === null || customerData.phone === "") {
      areaStatus = "critical";
      infoText = "The phone field must be 10 characters long.";
      title = "Warning";
      return false;
    } else {
      if (customerData.phone.charAt(0) != "+") {
        areaStatus = "critical";
        infoText = "Phone number must start with '+'";
        title = "Warning";
        return false;
      } else if (customerData.phone.charAt(1) != "4") {
        areaStatus = "critical";
        infoText = "After '+' phone number must continue with 4";
        title = "Warning";
        return false;
      } else {
        return true;
      }
    }
  }
  if (isPhoneCorrect()) {
    areaStatus = "success";
    infoText = `You can successfully continue`;
    title = "Success";
  }

  useBuyerJourney(({ canBlockProgress }) => {
    if (canBlockProgress && !isPhoneCorrect()) {
      return {
        behavior: "block",
        reason: `Phone Length.`,
        errors: [
          {
            // Show a validation error on the page
            message: "Phone Length Cannot Be Greater Than 10 or Empty",
          },
        ],
      };
    }
    return {
      behavior: "allow",
      perform: () => {
        // Ensure any errors are hidden
        clearValidationErrors();
      },
    };
  });
  function clearValidationErrors() {
    setValidationError("");
  }
  if (areaStatus != null && infoText != null && title != null) {
    return (
      <Banner title={title} status={areaStatus}>
        {infoText}
      </Banner>
    );
  } else {
    return null;
  }
}
