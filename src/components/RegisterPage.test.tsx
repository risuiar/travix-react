

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RegisterPage } from "./RegisterPage";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "../contexts/LanguageProvider";
import { UserAuthProvider } from "../contexts/UserAuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("RegisterPage", () => {
  it("renders RegisterPage without crashing", () => {
    const queryClient = new QueryClient();
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <UserAuthProvider>
            <LanguageProvider>
              <RegisterPage />
            </LanguageProvider>
          </UserAuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  const matches = screen.getAllByText(/Crear cuenta|register.title/i);
  expect(matches.length).toBeGreaterThan(0);
  });
});
