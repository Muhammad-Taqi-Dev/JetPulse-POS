/**
 * @license
 * Copyright (c) 2014, 2026, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
import * as ko from "knockout";
import { whenDocumentReady } from "ojs/ojbootstrap";
import * as Config from "ojs/ojconfig";
import CspExpressionEvaluator = require("ojs/ojcspexpressionevaluator");
import rootViewModel from "./appController";
import "ojs/ojknockout";
import "ojs/ojmodule";
import "ojs/ojnavigationlist";
import "ojs/ojbutton";
import "ojs/ojtoolbar";

// Import Custom Knockout Binding Handlers
import "./bindings/custom-bindings";

// Import & Register Modular Components
import { registerComponents } from "./components/index";

const oj = (window as any).oj;

Config.setExpressionEvaluator(
  new CspExpressionEvaluator({
    globalScope: {
      oj
    }
  })
);

function init(): void {
  // Register all modular POS Knockout components
  registerComponents();

  // Bind Root ViewModel to DOM
  const globalBody = document.getElementById("globalBody");
  if (globalBody) {
    ko.applyBindings(rootViewModel, globalBody);
  }
}

whenDocumentReady().then(function () {
  if (document.body.classList.contains("oj-hybrid")) {
    document.addEventListener("deviceready", init);
  } else {
    init();
  }
});
