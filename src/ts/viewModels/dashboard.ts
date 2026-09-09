/**
 * @license
 * Copyright (c) 2014, 2026, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
import * as AccUtils from "../accUtils";
import rootViewModel from "../appController";

class DashboardViewModel {
  rootModel: typeof rootViewModel;

  constructor() {
    this.rootModel = rootViewModel;
  }

  connected(): void {
    AccUtils.announce("POS Register workspace loaded.");
    document.title = "POS Register - ApexPOS Enterprise";
  }

  disconnected(): void {
    // Cleanup if needed
  }

  transitionCompleted(): void {
    // View transition complete
  }
}

export = DashboardViewModel;
