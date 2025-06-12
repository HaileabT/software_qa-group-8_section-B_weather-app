jest.mock("./app.js", () => ({
  initApp: jest.fn(),
}));

import { initApp } from "./app.js";
import "./main.js";
describe("main.js", () => {
  it("calls initializeApp when DOMContentLoaded fires", () => {
    const init = { initApp };
    const spy = jest.spyOn(init, "initApp");
    document.dispatchEvent(new Event("DOMContentLoaded"));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
