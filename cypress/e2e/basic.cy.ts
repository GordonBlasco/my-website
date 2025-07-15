// cypress/e2e/smoke.cy.ts
describe("Smoke test", () => {
  it("just loads the homepage", () => {
    cy.visit("/");
    expect(true).to.equal(true); // Always true
  });
});
