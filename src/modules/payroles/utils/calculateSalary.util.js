function calculateSalary(earnings = [], deductions = [])
{
    const grossSalary = earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const netSalary = grossSalary - totalDeductions;

    return { grossSalary, totalDeductions, netSalary };
}

export default calculateSalary;