export function validatePayrollCreation(month, year)
{

    const payrollDate = new Date(year, month - 1, 1);

    const now = new Date();

    const startLimit = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const endLimit = new Date(now.getFullYear(), now.getMonth(), 1);

    if (payrollDate < startLimit) {
        throw new Error(
            "Payroll cannot be created for more than 2 months in the past"
        );
    }

    if (payrollDate > endLimit) {
        throw new Error(
            "Payroll cannot be created for future months"
        );
    }
}