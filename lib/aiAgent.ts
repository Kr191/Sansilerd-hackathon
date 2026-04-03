import { Property } from './sansiriData'

export interface InvestmentCriteria {
  budget_min: number
  budget_max: number
  goal: 'rent' | 'flip'
  location?: string
  income?: number
  expense?: number
}

export interface MatchScore {
  property: Property
  score: number
  rank: number
  reasons: string[]
  budgetFit: number
  roiFit: number
  locationFit: number
  riskLevel: 'low' | 'medium' | 'high'
}

export class AIInvestmentAgent {
  /**
   * Calculate comprehensive match score for a property
   */
  calculateMatchScore(property: Property, criteria: InvestmentCriteria): MatchScore {
    // 1. Budget Fit Score (40%)
    const budgetMid = (criteria.budget_min + criteria.budget_max) / 2
    const budgetRange = criteria.budget_max - criteria.budget_min
    const budgetDiff = Math.abs(property.price - budgetMid)
    const budgetFit = Math.max(0, 100 - (budgetDiff / budgetRange) * 100)

    // 2. ROI Fit Score (30%)
    let roiFit = 0
    if (criteria.goal === 'rent') {
      // For rental: prioritize rental yield
      roiFit = Math.min(100, property.rentalYield * 12)
    } else {
      // For flip: prioritize capital gain
      roiFit = Math.min(100, property.capitalGainProjection.year3 * 5)
    }

    // 3. Location Fit Score (30%)
    const locationFit = property.locationScore

    // Calculate weighted score
    const totalScore = (budgetFit * 0.4) + (roiFit * 0.3) + (locationFit * 0.3)

    // Generate reasons
    const reasons = this.generateReasons(property, criteria, budgetFit, roiFit)

    // Assess risk level
    const riskLevel = this.assessRiskLevel(property, criteria)

    return {
      property,
      score: Math.round(totalScore * 10) / 10,
      rank: 0, // Will be set later
      reasons,
      budgetFit,
      roiFit,
      locationFit,
      riskLevel
    }
  }

  /**
   * Generate human-readable reasons for recommendation
   */
  private generateReasons(
    property: Property,
    criteria: InvestmentCriteria,
    budgetFit: number,
    roiFit: number
  ): string[] {
    const reasons: string[] = []

    // Budget reasons
    if (budgetFit > 80) {
      reasons.push('Fits your budget well')
    } else if (property.price < criteria.budget_max * 0.7) {
      reasons.push('Priced below budget — saves capital')
    }

    // ROI reasons
    if (criteria.goal === 'rent') {
      if (property.rentalYield > 6) {
        reasons.push(`High rental yield ${property.rentalYield}%`)
      }
      if (property.occupancyRate > 90) {
        reasons.push('High occupancy rate')
      }
    } else {
      if (property.capitalGainProjection.year3 > 12) {
        reasons.push(`Strong capital gain ${property.capitalGainProjection.year3}% in 3 years`)
      }
    }

    // Location reasons
    if (property.locationScore > 90) {
      reasons.push('Prime location')
    }
    if (property.nearBTS || property.nearMRT) {
      reasons.push('Near BTS/MRT')
    }

    // Liquidity
    if (property.liquidityScore > 90) {
      reasons.push('High liquidity — easy to sell')
    }

    return reasons.slice(0, 3) // Return top 3 reasons
  }

  /**
   * Assess investment risk level
   */
  private assessRiskLevel(property: Property, criteria: InvestmentCriteria): 'low' | 'medium' | 'high' {
    let riskScore = 0

    // Price vs budget
    const priceRatio = property.price / criteria.budget_max
    if (priceRatio > 0.9) riskScore += 2
    else if (priceRatio > 0.7) riskScore += 1

    // Location score
    if (property.locationScore < 70) riskScore += 2
    else if (property.locationScore < 85) riskScore += 1

    // Liquidity
    if (property.liquidityScore < 70) riskScore += 2
    else if (property.liquidityScore < 85) riskScore += 1

    // Occupancy rate (for rent)
    if (criteria.goal === 'rent' && property.occupancyRate < 80) {
      riskScore += 2
    }

    if (riskScore >= 5) return 'high'
    if (riskScore >= 3) return 'medium'
    return 'low'
  }

  /**
   * Get top property matches
   */
  getTopMatches(properties: Property[], criteria: InvestmentCriteria, limit: number = 3): MatchScore[] {
    const scored = properties.map(property => 
      this.calculateMatchScore(property, criteria)
    )

    // Sort by score
    scored.sort((a, b) => b.score - a.score)

    // Assign ranks
    scored.forEach((match, index) => {
      match.rank = index + 1
    })

    return scored.slice(0, limit)
  }

  /**
   * Calculate loan assessment
   */
  calculateLoanAssessment(income: number, expense: number, downPayment: number, propertyPrice?: number, interestRate = 4.2, tenure = 20) {
    // Monthly mortgage payment on the new property
    const loanAmount = propertyPrice ? propertyPrice - downPayment : 0
    const monthlyRate = interestRate / 100 / 12
    const months = tenure * 12
    const mortgagePayment = loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)
      : 0

    // DTI = (existing obligations + new mortgage) / gross income
    const totalDebt = expense + mortgagePayment
    const dti = totalDebt / income

    const maxMonthlyPayment = income * 0.35
    const interestRateCalc = 0.065 / 12
    const maxLoan = (maxMonthlyPayment * (Math.pow(1 + interestRateCalc, months) - 1)) /
                    (interestRateCalc * Math.pow(1 + interestRateCalc, months))

    return {
      maxLoan: Math.round(maxLoan),
      monthlyCapacity: Math.round(maxMonthlyPayment),
      mortgagePayment: Math.round(mortgagePayment),
      dti: Math.round(dti * 1000) / 1000, // 3 decimal places for accuracy
      status: dti < 0.4 ? 'passed' : dti < 0.5 ? 'warning' : 'failed',
      recommendation: this.getLoanRecommendation(dti, maxLoan, downPayment)
    }
  }

  private getLoanRecommendation(dti: number, maxLoan: number, downPayment: number): string {
    if (dti < 0.3) {
      return 'Excellent financial standing. Max loan capacity: ฿' + (maxLoan / 1000000).toFixed(1) + 'M'
    } else if (dti < 0.4) {
      return 'Good financial standing. Recommended loan up to ฿' + (maxLoan * 0.8 / 1000000).toFixed(1) + 'M'
    } else if (dti < 0.5) {
      return 'Debt load is moderately high. Consider reducing expenses before applying.'
    } else {
      return 'Debt load too high. Additional borrowing is not recommended at this time.'
    }
  }

  /**
   * Simulate investment returns
   */
  simulateInvestment(
    property: Property,
    downPayment: number,
    interestRate: number,
    tenure: number,
    goal: 'rent' | 'flip'
  ) {
    const loanAmount = property.price - downPayment
    const monthlyRate = interestRate / 100 / 12
    const months = tenure * 12

    // Calculate monthly payment
    const monthlyPayment = loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
        (Math.pow(1 + monthlyRate, months) - 1)
      : 0

    const totalPayment = monthlyPayment * months + downPayment

    // Calculate returns based on goal
    let roi = 0
    let paybackPeriod = 0
    let projectedProfit = 0

    if (goal === 'rent') {
      const monthlyRent = property.averageRent
      const occupancy = (property.occupancyRate ?? 85) / 100
      const effectiveRent = monthlyRent * occupancy
      // Expenses: maintenance + common fee + land tax ≈ 1.5% of price per year / 12
      const monthlyExpenses = Math.round((property.price * 0.015) / 12)
      const netMonthlyIncome = effectiveRent - monthlyPayment - monthlyExpenses
      const annualIncome = netMonthlyIncome * 12
      roi = downPayment > 0 ? (annualIncome / downPayment) * 100 : 0
      paybackPeriod = downPayment / (netMonthlyIncome > 0 ? netMonthlyIncome : 1)
      projectedProfit = annualIncome * tenure
    } else {
      // Flip scenario
      const projectedValue = property.price * (1 + property.capitalGainProjection.year5 / 100)
      projectedProfit = projectedValue - totalPayment
      roi = (projectedProfit / downPayment) * 100
      paybackPeriod = 5 // Typical flip period
    }

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      roi: Math.round(roi * 10) / 10,
      rentalYield: property.rentalYield,
      paybackPeriod: Math.round(paybackPeriod / 12 * 10) / 10,
      projectedProfit: Math.round(projectedProfit),
      monthlyRent: property.averageRent,
      netMonthlyCashFlow: goal === 'rent'
        ? Math.round(
            property.averageRent * ((property.occupancyRate ?? 85) / 100)
            - monthlyPayment
            - (property.price * 0.015) / 12
          )
        : 0
    }
  }

  /**
   * Generate AI verdict and recommendation
   */
  generateVerdict(
    property: Property,
    simulation: any,
    loanAssessment: any,
    criteria: InvestmentCriteria
  ): {
    decision: 'recommended' | 'consider' | 'not-recommended'
    confidence: number
    summary: string
    pros: string[]
    cons: string[]
    aiInsight: string
  } {
    const pros: string[] = []
    const cons: string[] = []
    let score = 50

    // Analyze ROI — use gross rental yield if available, else simulation roi
    const grossYield = (property as any).rentalYield ?? simulation.rentalYield ?? simulation.roi
    if (grossYield > 6.5) {
      pros.push(`Strong rental yield (${grossYield.toFixed(1)}%)`)
      score += 15
    } else if (grossYield >= 5) {
      pros.push(`Rental yield near market average (${grossYield.toFixed(1)}%)`)
      score += 5
    } else if (grossYield < 4) {
      cons.push(`Low rental yield (${grossYield.toFixed(1)}%)`)
      score -= 15
    }

    // Analyze loan capacity
    if (loanAssessment.status === 'passed') {
      pros.push('Loan capacity sufficient — strong financial profile')
      score += 10
    } else if (loanAssessment.status === 'failed') {
      cons.push('High debt load — loan approval may be difficult')
      score -= 20
    }

    // Analyze location
    if (property.locationScore > 90) {
      pros.push('Prime location with high growth potential')
      score += 10
    }

    // Analyze liquidity
    if (property.liquidityScore > 85) {
      pros.push('High liquidity — easy to exit')
      score += 5
    } else if (property.liquidityScore < 70) {
      cons.push('Low liquidity — may be difficult to sell')
      score -= 10
    }

    // Analyze cash flow (for rent)
    if (criteria.goal === 'rent') {
      if (simulation.netMonthlyCashFlow > 0) {
        pros.push(`Positive cash flow +฿${simulation.netMonthlyCashFlow.toLocaleString()}/month`)
        score += 10
      } else {
        cons.push('Negative cash flow — requires monthly top-up')
        score -= 15
      }
    }

    // Determine decision
    let decision: 'recommended' | 'consider' | 'not-recommended'
    if (score >= 70) decision = 'recommended'
    else if (score >= 50) decision = 'consider'
    else decision = 'not-recommended'

    // Generate AI insight
    const aiInsight = this.generateAIInsight(property, simulation, criteria, decision)

    return {
      decision,
      confidence: Math.min(95, Math.max(60, score)),
      summary: this.generateSummary(property, simulation, decision),
      pros,
      cons,
      aiInsight
    }
  }

  private generateSummary(property: Property, simulation: any, decision: string): string {
    if (decision === 'recommended') {
      return `${property.name} is a strong investment choice with ${simulation.roi}% ROI and a prime location.`
    } else if (decision === 'consider') {
      return `${property.name} has some merit but review the risk factors carefully before committing.`
    } else {
      return `${property.name} does not align well with your investment goals at this time.`
    }
  }

  private generateAIInsight(
    property: Property,
    simulation: any,
    criteria: InvestmentCriteria,
    decision: string
  ): string {
    if (decision === 'recommended') {
      if (criteria.goal === 'rent') {
        return `This project is well-suited for rental with a ${property.rentalYield}% annual yield and ${property.occupancyRate}% occupancy rate. Its proximity to employment hubs and transit makes sustained tenant demand likely.`
      } else {
        return `This project has strong capital appreciation potential of ${property.capitalGainProjection.year5}% over 5 years. Prime location and high liquidity make it a solid flip candidate.`
      }
    } else if (decision === 'consider') {
      return `This project has location advantages but carries some cash flow and liquidity risk. Compare with other options before making a final decision.`
    } else {
      return `Given your financial profile and goals, we recommend exploring projects with higher ROI or a better budget fit.`
    }
  }
}

// Export singleton instance
export const aiAgent = new AIInvestmentAgent()
