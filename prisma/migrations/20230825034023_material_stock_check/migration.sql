ALTER TABLE "Material" 
ADD CONSTRAINT stock_check 
CHECK (stock >= 0);