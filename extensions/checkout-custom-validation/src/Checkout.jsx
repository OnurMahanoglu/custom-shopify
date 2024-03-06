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

export default reactExtension(
  "purchase.checkout.delivery-address.render-before",
  () => <Extension />
);

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

  let desiredPhoneLength =15;

  function isPhoneCorrect() {
    if (customerData.phone === null || customerData.phone === "") {
      areaStatus = "critical";
      infoText = "The phone field must be 10 characters long.";
      title = "Warning";
      return false;
    } else {
      if (customerData.phone.length > desiredPhoneLength) {
        areaStatus = "critical";
        infoText = "The phone field must be 10 characters long.";
        title = "Warning";
        return false;
      } else {
        return true;
      }
    }
  }
  function isZipCodeCorrect() {
    if (customerData.zip === null || customerData.zip === "" || customerData.zip === undefined) {
      areaStatus = "critical";
      infoText = "Postal Code field cannot be empty.";
      title = "Warning";
      return false;
    } else {
      return true;
    }
  }
  if (
    isPhoneCorrect() &&
    isZipCodeCorrect() &&
    customerData.phone.length < desiredPhoneLength
  ) {
    areaStatus = "success";
    infoText = `Test ${customerData.phone} ${customerData.zip}`;
    title = "Success";
  }

  useBuyerJourney(({ canBlockProgress }) => {
    if (canBlockProgress && !isZipCodeCorrect()) {
      return {
        behavior: "block",
        reason: `Area Not Filled.`,
        errors: [
          {
            // Show a validation error on the page
            message: "Postal Code Cannot Be Empty",
          },
        ],
      };
    }
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
