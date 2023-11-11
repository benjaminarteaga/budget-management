-- DropForeignKey
ALTER TABLE "MaterialsOnBudgets" DROP CONSTRAINT "MaterialsOnBudgets_budgetId_fkey";

-- AddForeignKey
ALTER TABLE "MaterialsOnBudgets" ADD CONSTRAINT "MaterialsOnBudgets_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
