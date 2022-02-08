export enum SaleOrderPaymentTypeRetail
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
    // [Description("მანუალური")]
    Manual = 98,
    // [Description("სხვა")]
    Other = 99,
}

export const SaleOrderPaymentTypeRetailObj = {
    [SaleOrderPaymentTypeRetail.Cash]: 'ნაღდი ანგარიშსწორება',
    [SaleOrderPaymentTypeRetail.BOG]: 'საქართველოს ბანკი/ინტეგრირებული',
    [SaleOrderPaymentTypeRetail.BOGExternal]: 'საქართველოს ბანკი',
    [SaleOrderPaymentTypeRetail.TBCExternal]: 'თიბისი ბანკი',
    [SaleOrderPaymentTypeRetail.LibertyExternal]: 'ლიბერთი ბანკი',
    [SaleOrderPaymentTypeRetail.ProcreditExternal]: 'პროკრედიტ ბანკი',
    [SaleOrderPaymentTypeRetail.Manual]: 'მანუალური',
    [SaleOrderPaymentTypeRetail.Other]: 'სხვა',
}