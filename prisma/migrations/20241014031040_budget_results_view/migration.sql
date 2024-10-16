CREATE VIEW "BudgetResultsView" AS
SELECT
  b.id AS "budgetId",
  b."salesPrice",
  COALESCE(materials."totalMaterialCost", 0) AS "totalMaterialCost",
  COALESCE(tools."totalToolAssigned", 0) AS "totalToolAssigned",
  b."salesPrice" - COALESCE(materials."totalMaterialCost", 0) - COALESCE(tools."totalToolAssigned", 0) AS profit
FROM
  "Budget" b
LEFT JOIN (
  SELECT
    mb."budgetId",
    SUM(mb.quantity * ms."unitPrice") AS "totalMaterialCost"
  FROM
    "MaterialsOnBudgets" mb
  LEFT JOIN "Material" ms ON ms.id = mb."materialId"
  GROUP BY mb."budgetId"
) materials ON materials."budgetId" = b.id
LEFT JOIN (
  SELECT
    tb."budgetId",
    SUM(tb.quantity) AS "totalToolAssigned"
  FROM
    "ToolsOnBudgets" tb
  LEFT JOIN "Tool" ts ON ts.id = tb."toolId"
  GROUP BY tb."budgetId"
) tools ON tools."budgetId" = b.id
WHERE
  b."deletedAt" IS NULL
ORDER BY b.id;
