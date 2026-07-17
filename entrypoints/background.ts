import { ApplyActiveRulesUseCase } from "@/src/domain/usecases/state/apply-active-rules";
import { LoadRuleStateUseCase } from "@/src/domain/usecases/state/load-rule-state";
import { BrowserStateRepository } from "@/src/data/repositories/browser-state-repository";
import { RuleMigrationRepository } from "@/src/data/repositories/rule-migration-repository";

export default defineBackground(() => {
  const repository = new BrowserStateRepository(new RuleMigrationRepository());
  const loadRuleState = new LoadRuleStateUseCase(repository);
  const applyActiveRules = new ApplyActiveRulesUseCase(repository);

  const apply = async (): Promise<void> => {
    await applyActiveRules.execute(await loadRuleState.execute());
  };

  browser.runtime.onInstalled.addListener(() => void apply());
  browser.runtime.onStartup.addListener(() => void apply());
});
