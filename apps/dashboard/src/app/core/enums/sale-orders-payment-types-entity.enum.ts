export enum SaleOrderPaymentTypeEntity
{
    // [Description("ნაღდი ანგარიშსწორება")]
    Cash = 0,
    // [Description("საქართველოს ბანკი")]
    BOG = 1,
    // [Description("საქართველოს ბანკი/არაინტეგრირებული")]
    BOGExternal = 2,
    // [Description("თიბისი ბანკი/არაინტეგრირებული")]
    TBCExternal = 3,
    // [Description("ლიბერთი ბანკი/არაინტეგრირებული")]
    LibertyExternal = 4,
    // [Description("პროკრედიტ ბანკი/არაინტეგრირებული")]
    ProcreditExternal = 5,
    // [Description("კონსიგნაცია")]
    Manual = 98,
    // [Description("სხვა")]
    Other = 99,
}

export const SaleOrderPaymentTypeRetailObj = {
    [SaleOrderPaymentTypeEntity.Cash]: 'ნაღდი ანგარიშსწორება',
    [SaleOrderPaymentTypeEntity.BOG]: 'საქართველოს ბანკი/ინტეგრირებული',
    [SaleOrderPaymentTypeEntity.BOGExternal]: 'საქართველოს ბანკი',
    [SaleOrderPaymentTypeEntity.TBCExternal]: 'თიბისი ბანკი',
    [SaleOrderPaymentTypeEntity.LibertyExternal]: 'ლიბერთი ბანკი',
    [SaleOrderPaymentTypeEntity.ProcreditExternal]: 'პროკრედიტ ბანკი',
    [SaleOrderPaymentTypeEntity.Manual]: 'კონსიგნაცია',
    [SaleOrderPaymentTypeEntity.Other]: 'სხვა',
}