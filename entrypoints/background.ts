import { ApplyActiveRulesUseCase } from "@/src/domain/usecases/state/apply-active-rules";
import { LoadRuleStateUseCase } from "@/src/domain/usecases/state/load-rule-state";
import { BrowserStateRepository } from "@/src/data/repositories/browser-state-repository";
import { RuleMigrationRepository } from "@/src/data/repositories/rule-migration-repository";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async () => {
    const repository = new BrowserStateRepository(new RuleMigrationRepository());
    const state = await new LoadRuleStateUseCase(repository).execute();
    await new ApplyActiveRulesUseCase(repository).execute(state);
  });
});
