import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, businessType, optimizationType, isQuestion, context, generateThreeOptions, details } = body;

    // Handle chat questions with detailed business advice
    if (isQuestion && optimizationType === 'chat') {
      const chatResponses: Record<string, Record<string, string>> = {
        construction: {
          "reduce material costs": `# How to Reduce Material Costs in Construction

## 1. **Bulk Purchasing & Supplier Negotiation**
- **Action**: Negotiate volume discounts with suppliers
- **Savings**: 5-15% on material costs
- **Tip**: Build long-term relationships with 2-3 key suppliers for better pricing

## 2. **Local Material Sourcing**
- **Action**: Source materials within 50km radius when possible
- **Savings**: $8,500+ per project (transportation costs)
- **Tip**: Use local lumber yards, concrete plants, and hardware stores

## 3. **Value Engineering**
- **Action**: Review designs for cost-effective alternatives
- **Savings**: 10-20% on project costs
- **Tip**: Consider alternative materials that meet code but cost less

## 4. **Seasonal Timing**
- **Action**: Schedule material purchases during off-peak seasons
- **Savings**: $15,000+ on large projects
- **Tip**: Buy lumber in fall/winter, concrete in spring

## 5. **Owner-Supplied Materials**
- **Action**: Allow clients to purchase certain items directly
- **Savings**: Eliminate markup on fixtures, appliances
- **Tip**: Create a list of approved items clients can source

**Expected Total Savings: 15-25% of material costs**`,

          "best practices for project estimation": `# Best Practices for Construction Project Estimation

## 1. **Detailed Takeoff Process**
- Measure every component accurately
- Use digital takeoff software for precision
- Add 5-10% contingency for unknowns

## 2. **Material Cost Research**
- Get 3+ quotes for major materials
- Check current market prices (prices fluctuate)
- Include delivery costs in estimates

## 3. **Labor Cost Calculation**
- Use local union rates or market rates
- Factor in overtime if timeline is tight
- Include supervision and management costs

## 4. **Overhead & Profit**
- Standard overhead: 10-15%
- Profit margin: 8-12%
- Adjust based on project complexity

## 5. **Risk Assessment**
- Identify potential delays or issues
- Add appropriate contingencies
- Document assumptions clearly

**Pro Tip**: Always review past projects to improve accuracy!`,

          "optimize labor costs": `# How to Optimize Labor Costs in Construction

## 1. **Efficient Scheduling**
- **Action**: Minimize crew idle time between tasks
- **Savings**: 10-15% of labor costs
- **Tip**: Use project management software for scheduling

## 2. **Skill Matching**
- **Action**: Match worker skills to specific tasks
- **Savings**: 20% faster completion = lower costs
- **Tip**: Cross-train workers for flexibility

## 3. **Pre-fabrication**
- **Action**: Pre-fab components off-site when possible
- **Savings**: 15-25% on labor hours
- **Tip**: Works great for repetitive elements

## 4. **Technology Tools**
- **Action**: Use power tools and equipment efficiently
- **Savings**: 30% faster work = lower labor hours
- **Tip**: Invest in quality tools that save time

## 5. **Performance Incentives**
- **Action**: Reward crews for on-time/early completion
- **Savings**: 5-10% through increased productivity
- **Tip**: Set clear, achievable targets

**Expected Savings: $15,000-$30,000 per project**`,

          "building code compliance tips": `# Building Code Compliance Tips

## 1. **Stay Updated**
- Review local code changes quarterly
- Attend builder association meetings
- Subscribe to code update services

## 2. **Pre-Construction Review**
- Submit plans for early review
- Get inspector feedback before starting
- Address concerns proactively

## 3. **Documentation**
- Keep detailed records of all work
- Photograph before covering work
- Maintain inspection logs

## 4. **Common Code Areas**
- **Electrical**: Proper wire sizing, GFCI placement
- **Plumbing**: Vent requirements, fixture spacing
- **Structural**: Load calculations, foundation depth
- **Energy**: Insulation R-values, window ratings

## 5. **Work with Inspectors**
- Build relationships with local inspectors
- Ask questions before problems arise
- Be present during inspections

**Pro Tip**: Non-compliance can cost 2-3x to fix later!`
        },
        trucking: {
          "reduce fuel costs": `# How to Reduce Fuel Costs in Trucking

## 1. **Route Optimization**
- **Action**: Use GPS routing software to find shortest routes
- **Savings**: 15-20% on fuel costs ($3,300+/month)
- **Tip**: Avoid traffic, construction, and hilly routes when possible

## 2. **Speed Management**
- **Action**: Maintain 55-60 mph on highways
- **Savings**: 10-15% fuel efficiency
- **Tip**: Every 5 mph over 60 mph = 10% more fuel

## 3. **Idle Reduction**
- **Action**: Limit idling to 5 minutes maximum
- **Savings**: $1,500-$3,000 per truck annually
- **Tip**: Use APU (Auxiliary Power Unit) for climate control

## 4. **Tire Maintenance**
- **Action**: Keep tires properly inflated
- **Savings**: 3-5% fuel efficiency
- **Tip**: Check pressure weekly, use low-rolling-resistance tires

## 5. **Aerodynamic Improvements**
- **Action**: Install side skirts, trailer tails
- **Savings**: 5-7% fuel reduction
- **Tip**: Close gaps between cab and trailer

**Expected Savings: $30,000-$50,000 annually per fleet**`,

          "optimize routes": `# Route Optimization Best Practices

## 1. **Use Technology**
- Implement route optimization software
- Real-time traffic updates
- Weather condition monitoring

## 2. **Load Consolidation**
- Combine multiple deliveries on same route
- Reduce total miles driven
- Maximize payload capacity

## 3. **Backhaul Opportunities**
- Find return loads to avoid empty miles
- Use load boards and freight matching
- Build relationships with shippers

## 4. **Driver Training**
- Teach efficient driving techniques
- Route planning skills
- Time management

## 5. **Regular Route Review**
- Analyze route efficiency monthly
- Identify improvement opportunities
- Adjust based on data

**Savings Potential: 20-30% reduction in total miles**`,

          "reduce empty miles": `# How to Reduce Empty Miles

## 1. **Load Matching Services**
- **Action**: Use digital freight matching platforms
- **Savings**: 35% reduction in empty miles
- **Tip**: Sign up for multiple load boards

## 2. **Backhaul Planning**
- **Action**: Plan return trips before leaving
- **Savings**: $2,310/month per truck
- **Tip**: Build relationships with shippers on return routes

## 3. **Regional Focus**
- **Action**: Focus operations in specific regions
- **Savings**: Better load density = fewer empty miles
- **Tip**: Become expert in 2-3 key lanes

## 4. **Broker Relationships**
- **Action**: Work with 3-5 reliable brokers
- **Savings**: Consistent backhaul opportunities
- **Tip**: Negotiate better rates with volume

## 5. **Fleet Coordination**
- **Action**: Coordinate multiple trucks for better coverage
- **Savings**: More load options = less empty miles
- **Tip**: Use dispatch software for coordination

**Target: Reduce empty miles from 30% to 15-20%**`,

          "maintenance practices save money": `# Maintenance Practices That Save Money

## 1. **Predictive Maintenance**
- **Action**: Use telematics to predict failures
- **Savings**: 25% reduction in maintenance costs
- **Tip**: Fix issues before they become expensive

## 2. **Regular Oil Changes**
- **Action**: Follow manufacturer recommendations
- **Savings**: Extend engine life, prevent costly repairs
- **Tip**: Use quality oil and filters

## 3. **Tire Management**
- **Action**: Rotate, balance, and align regularly
- **Savings**: $2,000-$3,000 per truck annually
- **Tip**: Monitor tread depth and pressure

## 4. **Pre-Trip Inspections**
- **Action**: Daily inspections catch issues early
- **Savings**: Prevent breakdowns and delays
- **Tip**: Train drivers on what to look for

## 5. **Maintenance Records**
- **Action**: Keep detailed service history
- **Savings**: Better resale value, warranty claims
- **Tip**: Use fleet management software

**Expected Savings: $1,625/month per fleet**`
        },
        restaurant: {
          "reduce food waste": `# How to Reduce Food Waste in Restaurants

## 1. **Inventory Tracking**
- **Action**: Use digital inventory management system
- **Savings**: Reduce waste by 50% ($1,680/month)
- **Tip**: Track what's used vs. what's thrown away

## 2. **First In, First Out (FIFO)**
- **Action**: Rotate inventory properly
- **Savings**: Prevent spoilage
- **Tip**: Label all items with dates

## 3. **Portion Control**
- **Action**: Standardize serving sizes
- **Savings**: 3% food cost reduction ($840/month)
- **Tip**: Use scales and measuring tools

## 4. **Menu Engineering**
- **Action**: Feature items that use similar ingredients
- **Savings**: Reduce waste from unused ingredients
- **Tip**: Design menu around inventory

## 5. **Creative Use of Leftovers**
- **Action**: Turn trimmings into stocks, sauces
- **Savings**: Maximize ingredient value
- **Tip**: Train kitchen staff on techniques

**Target: Reduce waste from 12% to 6% of purchases**`,

          "ideal food cost percentage": `# Ideal Food Cost Percentage

## Industry Standards:
- **Fast Casual**: 28-32%
- **Full Service**: 28-35%
- **Fine Dining**: 30-35%
- **Your Target**: 28-32% is optimal

## How to Calculate:
Food Cost % = (Cost of Food Sold / Food Sales) × 100

## If Your Food Cost is Too High:
1. **Review Menu Pricing** - Increase prices on low-margin items
2. **Negotiate with Suppliers** - Get better bulk pricing
3. **Reduce Waste** - Track and minimize spoilage
4. **Portion Control** - Standardize serving sizes
5. **Menu Engineering** - Feature high-margin items

## If Your Food Cost is Too Low:
- You might be under-portioning
- Quality might be suffering
- Customer satisfaction may drop

**Pro Tip**: Track food cost weekly, not monthly!`,

          "optimize inventory management": `# Inventory Management Optimization

## 1. **Automated Systems**
- **Action**: Use digital inventory software
- **Savings**: Reduce over-ordering by 20%
- **Tip**: Set automatic reorder points

## 2. **Regular Audits**
- **Action**: Count inventory weekly
- **Savings**: Catch discrepancies early
- **Tip**: Rotate who does the count

## 3. **Supplier Relationships**
- **Action**: Work with 2-3 primary suppliers
- **Savings**: Better pricing, reliable delivery
- **Tip**: Negotiate volume discounts

## 4. **Par Levels**
- **Action**: Set minimum stock levels
- **Savings**: Prevent running out or overstocking
- **Tip**: Adjust based on sales patterns

## 5. **Storage Organization**
- **Action**: Organize by use frequency
- **Savings**: Faster prep, less waste
- **Tip**: Label everything clearly

**Expected Savings: $2,240/month**`,

          "most profitable menu items": `# Menu Profitability Analysis

## How to Identify Profitable Items:
1. **High Contribution Margin** - Revenue minus food cost
2. **High Popularity** - Items that sell frequently
3. **Low Labor Time** - Quick to prepare
4. **Low Waste** - Use common ingredients

## Typically Most Profitable:
- **Beverages**: 70-80% margin
- **Appetizers**: 60-70% margin
- **Pasta Dishes**: 65-75% margin
- **Salads**: 70-80% margin

## Menu Engineering Strategy:
1. **Stars** (High profit, High sales) - Feature prominently
2. **Plowhorses** (Low profit, High sales) - Raise prices
3. **Puzzles** (High profit, Low sales) - Promote more
4. **Dogs** (Low profit, Low sales) - Consider removing

## Action Items:
- Calculate profit margin for each item
- Feature high-margin items prominently
- Train servers to upsell profitable items
- Remove unprofitable items

**Pro Tip**: Review menu profitability quarterly!`
        }
      };

      const lowerPrompt = prompt.toLowerCase();
      const businessChat = chatResponses[businessType] || {};
      
      // Find matching response
      let response = "I can help you with that! Here's some advice:\n\n";
      
      for (const [key, value] of Object.entries(businessChat)) {
        if (lowerPrompt.includes(key)) {
          response = value;
          break;
        }
      }

      // If no specific match, provide general advice
      if (response === "I can help you with that! Here's some advice:\n\n") {
        const generalAdvice: Record<string, string> = {
          construction: `# Construction Business Optimization Tips

Based on your question about "${prompt}", here are some key strategies:

## Cost Reduction Strategies:
1. **Material Sourcing**: Save 10-15% by buying in bulk and negotiating with suppliers
2. **Labor Efficiency**: Optimize scheduling to reduce idle time by 20%
3. **Project Management**: Use software to track costs and timelines
4. **Value Engineering**: Review designs for cost-effective alternatives

## Revenue Growth:
1. **Specialization**: Focus on high-margin project types
2. **Upselling**: Offer premium finishes and upgrades
3. **Referral Program**: Reward clients who refer new business
4. **Efficiency**: Complete projects faster = more projects per year

Would you like more specific advice on any of these areas?`,

          trucking: `# Fleet Optimization Tips

Based on your question about "${prompt}", here are key strategies:

## Cost Reduction:
1. **Fuel Efficiency**: Save 15-30% through route optimization and speed management
2. **Maintenance**: Predictive maintenance reduces costs by 25%
3. **Empty Miles**: Reduce from 30% to 15% through load matching
4. **Driver Training**: Improve efficiency by 8-10%

## Revenue Growth:
1. **Load Optimization**: Maximize payload capacity
2. **Premium Services**: Offer expedited, temperature-controlled options
3. **Route Efficiency**: More deliveries per day = higher revenue
4. **Fleet Utilization**: Keep trucks on the road more days per month

Would you like detailed advice on any specific area?`,

          restaurant: `# Restaurant Optimization Tips

Based on your question about "${prompt}", here are key strategies:

## Cost Reduction:
1. **Food Cost**: Target 28-32% (currently optimize from 35%)
2. **Waste Reduction**: Cut waste from 12% to 6% through better tracking
3. **Inventory**: Reduce over-ordering by 20% with better systems
4. **Labor**: Optimize scheduling to match customer flow

## Revenue Growth:
1. **Menu Engineering**: Feature high-margin items prominently
2. **Upselling**: Train staff to suggest appetizers, desserts, drinks
3. **Table Turnover**: Optimize service speed for more covers
4. **Pricing**: Review and adjust prices quarterly

Would you like specific strategies for any of these?`
        };
        response = generalAdvice[businessType] || `I understand you're asking about "${prompt}". For ${businessType} businesses, I recommend focusing on cost optimization, efficiency improvements, and revenue growth strategies. Would you like me to elaborate on any specific area?`;
      }

      return NextResponse.json({
        success: true,
        result: response,
        estimatedSavings: 0,
        businessType,
        optimizationType: 'chat'
      });
    }

    // Original optimization analysis responses
    const mockResponses = {
      construction: {
        estimate: (() => {
          const { trade, details } = body;
          
          if (trade && trade !== 'all') {
            // Trade-specific detailed breakdown
            const sqft = parseInt(details?.squareFootage || '2000');
            const bedrooms = parseInt(details?.bedrooms || '3');
            const bathrooms = parseFloat(details?.bathrooms || '2.5');
            
            // Provincial cost multipliers and regulations
            const provinceMultipliers: Record<string, number> = {
              'AB': 1.0, 'BC': 1.15, 'MB': 0.95, 'NB': 0.92, 'NL': 1.05,
              'NS': 0.98, 'NT': 1.25, 'NU': 1.30, 'ON': 1.10, 'PE': 0.95,
              'QC': 1.05, 'SK': 0.93, 'YT': 1.20
            };
            
            const province = details?.province || 'ON';
            const costMultiplier = provinceMultipliers[province] || 1.0;
            const laborRate = Math.round(155 * costMultiplier);
            
            // Provincial building code requirements
            const codeRequirements: Record<string, any> = {
              'BC': {
                energyCode: 'BC Energy Step Code',
                minPanel: 200,
                gfciRequired: 'All bathrooms, kitchens, outdoor, garage',
                afciRequired: 'All bedrooms, living areas',
                permitCost: '0.5-1% of project value'
              },
              'ON': {
                energyCode: 'Ontario Building Code Energy Requirements',
                minPanel: 200,
                gfciRequired: 'All bathrooms, kitchens, outdoor, garage, within 1.5m of water',
                afciRequired: 'All bedrooms, living areas',
                permitCost: '0.8-1.2% of project value'
              },
              'AB': {
                energyCode: 'Alberta Building Code',
                minPanel: 200,
                gfciRequired: 'All bathrooms, kitchens, outdoor, garage',
                afciRequired: 'All bedrooms',
                permitCost: '0.6-1% of project value'
              },
              'QC': {
                energyCode: 'Quebec Construction Code',
                minPanel: 200,
                gfciRequired: 'All bathrooms, kitchens, outdoor',
                afciRequired: 'All bedrooms',
                permitCost: '0.7-1.1% of project value'
              }
            };
            
            const provinceCode = codeRequirements[province] || {
              energyCode: 'National Building Code of Canada',
              minPanel: 200,
              gfciRequired: 'All bathrooms, kitchens, outdoor, garage',
              afciRequired: 'All bedrooms, living areas',
              permitCost: '0.5-1% of project value'
            };
            
            if (trade === 'electrical') {
              const outlets = parseInt(details?.electricalOutlets || String(Math.round(sqft / 50)));
              const fixtures = parseInt(details?.lightFixtures || String(Math.round(sqft / 80)));
              const panelAmps = Math.max(parseInt(details?.electricalPanel || '200'), provinceCode.minPanel);
              
              // Calculate materials with correct math
              const romex12_2_feet = Math.round(sqft * 0.8);
              const romex14_2_feet = Math.round(sqft * 0.5);
              const romex12_2_cost = Math.round(romex12_2_feet * 0.85);
              const romex14_2_cost = Math.round(romex14_2_feet * 0.65);
              const conduit_boxes = Math.round((romex12_2_cost + romex14_2_cost) * 0.6); // 60% of wire cost
              const wiring_conduit_total = romex12_2_cost + romex14_2_cost + conduit_boxes;
              
              const panel_cost = panelAmps >= 400 ? 8000 : panelAmps >= 200 ? 2000 : 1200;
              const breakers_cost = Math.round(panelAmps / 2 * 4.95); // ~$5 per breaker slot
              const panel_breakers_total = panel_cost + breakers_cost;
              
              const gfci_count = Math.round(outlets * 0.2);
              const standard_count = Math.round(outlets * 0.8);
              const gfci_cost = gfci_count * 25;
              const standard_cost = standard_count * 8;
              const switches_dimmers = Math.round(outlets * 0.3 * 15);
              const outlets_switches_total = gfci_cost + standard_cost + switches_dimmers;
              
              const led_fixtures_cost = Math.round(fixtures * 0.8 * 80);
              const ceiling_fans_count = Math.round(fixtures * 0.2);
              const ceiling_fans_cost = ceiling_fans_count * 150;
              const light_fixtures_total = led_fixtures_cost + ceiling_fans_cost;
              
              const hvac_electrical = Math.round((wiring_conduit_total + panel_breakers_total) * 0.15);
              
              const materials_total = wiring_conduit_total + panel_breakers_total + outlets_switches_total + light_fixtures_total + hvac_electrical;
              
              // Calculate labor
              const rough_in_hours = Math.round(outlets * 0.5 + fixtures * 0.8 + 25);
              const fixture_install_hours = Math.round(fixtures * 1.2);
              const panel_final_hours = Math.round(panelAmps / 20 + 10);
              const labor_hours = rough_in_hours + fixture_install_hours + panel_final_hours;
              const labor_total = Math.round(labor_hours * laborRate);
              
              // Apply provincial cost multiplier to materials
              const materials_total_adjusted = Math.round(materials_total * costMultiplier);
              const total_cost_adjusted = materials_total_adjusted + labor_total;
              
              const total_cost = materials_total + labor_total;
              
              // Calculate realistic savings (not contradicting base spec)
              const bulk_wire_savings = Math.round(wiring_conduit_total * 0.08); // 8% bulk discount
              const schedule_savings = Math.round(labor_total * 0.12); // 12% labor efficiency, not 20%
              const efficient_panel_savings = panelAmps >= 400 ? Math.round(panel_breakers_total * 0.15) : Math.round(panel_breakers_total * 0.10);
              const material_waste_reduction = Math.round(materials_total_adjusted * 0.05); // 5% waste reduction
              const total_savings = bulk_wire_savings + schedule_savings + efficient_panel_savings + material_waste_reduction;
              
              return `# Electrical Work - Detailed Estimate
## Location: ${details?.city || 'City'}, ${province}

## Project Specifications
- **Square Footage**: ${sqft} sq ft
- **Outlets**: ${outlets} outlets
- **Light Fixtures**: ${fixtures} fixtures
- **Electrical Panel**: ${panelAmps} amp service (${provinceCode.minPanel}A minimum required in ${province})
- **HVAC System**: ${details?.hvacSystem || 'Central AC'}
- **Province**: ${province} (Cost adjustment: ${costMultiplier > 1 ? '+' : ''}${Math.round((costMultiplier - 1) * 100)}% vs national average)

## Cost Breakdown

### Materials: $${materials_total_adjusted.toLocaleString()} ${costMultiplier !== 1.0 ? `(adjusted for ${province} pricing)` : ''}

#### Wiring & Conduit: $${wiring_conduit_total.toLocaleString()}
- **12/2 Romex**: ${romex12_2_feet} feet × $0.85/ft = **$${romex12_2_cost.toLocaleString()}**
- **14/2 Romex**: ${romex14_2_feet} feet × $0.65/ft = **$${romex14_2_cost.toLocaleString()}**
- **Conduit & boxes**: **$${conduit_boxes.toLocaleString()}**
- **Subtotal**: $${wiring_conduit_total.toLocaleString()}

#### Panel & Breakers: $${panel_breakers_total.toLocaleString()}
- **${panelAmps}A main panel**: **$${panel_cost.toLocaleString()}**
- **Circuit breakers**: **$${breakers_cost.toLocaleString()}**
- **Subtotal**: $${panel_breakers_total.toLocaleString()}

#### Outlets & Switches: $${outlets_switches_total.toLocaleString()}
- **GFCI outlets**: ${gfci_count} × $25 = **$${gfci_cost.toLocaleString()}**
- **Standard outlets**: ${standard_count} × $8 = **$${standard_cost.toLocaleString()}**
- **Switches & dimmers**: **$${switches_dimmers.toLocaleString()}**
- **Subtotal**: $${outlets_switches_total.toLocaleString()}

#### Light Fixtures: $${light_fixtures_total.toLocaleString()}
- **LED fixtures**: **$${led_fixtures_cost.toLocaleString()}**
- **Ceiling fans**: ${ceiling_fans_count} × $150 = **$${ceiling_fans_cost.toLocaleString()}**
- **Subtotal**: $${light_fixtures_total.toLocaleString()}

#### HVAC Electrical: $${hvac_electrical.toLocaleString()}
- Dedicated circuits for HVAC system
- Thermostat wiring and controls
- Subtotal: $${hvac_electrical.toLocaleString()}

**Materials Total: $${materials_total_adjusted.toLocaleString()}** ${costMultiplier !== 1.0 ? `(Base: $${materials_total.toLocaleString()} × ${costMultiplier.toFixed(2)} = $${materials_total_adjusted.toLocaleString()})` : ''}

### Labor: $${labor_total.toLocaleString()}
- **Total Hours**: ${labor_hours} hours @ $${laborRate}/hour (${province} rates)
- **Rough-in Wiring**: ${rough_in_hours} hours
- **Fixture Installation**: ${fixture_install_hours} hours
- **Panel & Final Connections**: ${panel_final_hours} hours

### Total Electrical Cost: $${total_cost_adjusted.toLocaleString()}
**Breakdown**: Materials $${materials_total_adjusted.toLocaleString()} + Labor $${labor_total.toLocaleString()} = **$${total_cost_adjusted.toLocaleString()}**

## 🏛️ ${province} Building Code Requirements

### Permits & Inspections Required:
- **Electrical Permit**: Required for all electrical work
- **Rough-in Inspection**: Before drywall installation
- **Final Inspection**: Before occupancy
- **Estimated Permit Cost**: ${provinceCode.permitCost}

### Code Compliance Requirements:
- **GFCI Protection**: ${provinceCode.gfciRequired}
- **AFCI Protection**: ${provinceCode.afciRequired}
- **Energy Code**: ${provinceCode.energyCode}
- **Minimum Panel**: ${provinceCode.minPanel}A service required
- **Wire Gauge**: 12 AWG for 20A circuits, 14 AWG for 15A circuits
- **Outlets**: Maximum 12 feet between outlets (NBC requirement)

### ${province}-Specific Requirements:
${province === 'BC' ? '- BC Energy Step Code compliance required\n- Higher efficiency standards than NBC\n- May qualify for BC Hydro rebates' :
province === 'ON' ? '- ESA (Electrical Safety Authority) inspection required\n- Must use licensed electrician\n- Tarion warranty may apply for new homes' :
province === 'QC' ? '- RBQ (Régie du bâtiment du Québec) permit required\n- Must use master electrician\n- French documentation may be required' :
province === 'AB' ? '- Safety Codes Council inspection required\n- Must use licensed electrician\n- Higher seismic requirements in some areas' :
'- Follow National Building Code of Canada\n- Provincial amendments may apply\n- Check with local building department'}

## 💰 Money-Saving Opportunities (Save $${total_savings.toLocaleString()})

1. **Bulk Wire Purchases** - Save $${bulk_wire_savings.toLocaleString()}
   - Order all wire at once for volume discount (8% savings)
   - Negotiate with supplier for better pricing
   - Reduces waste with proper planning

2. **Optimize Scheduling** - Save $${schedule_savings.toLocaleString()}
   - Coordinate with framers to run wire before drywall
   - Reduces labor time by 12% through better workflow
   - Fewer callbacks and repairs

3. **Efficient Panel Selection** - Save $${efficient_panel_savings.toLocaleString()}
   - Right-size panel for actual needs (avoid over-sizing)
   - Energy-efficient breakers reduce long-term costs
   - Better organization reduces installation time

4. **Material Waste Reduction** - Save $${material_waste_reduction.toLocaleString()}
   - Plan wire runs to minimize waste
   - Use cutting optimization software
   - Reuse offcuts where possible
   - Reduces material waste by 5%

**Total Potential Savings: $${total_savings.toLocaleString()}**
**Optimized Cost: $${(total_cost_adjusted - total_savings).toLocaleString()}**

## 📋 Additional ${province} Considerations:
- **Material Availability**: Check local supplier stock before ordering
- **Weather Delays**: Account for ${province === 'BC' || province === 'NS' ? 'rain' : province === 'AB' || province === 'SK' ? 'winter' : 'seasonal'} delays
- **Local Suppliers**: Use ${details?.city || 'local'} suppliers for faster delivery
- **Rebates Available**: Check ${province === 'BC' ? 'BC Hydro' : province === 'ON' ? 'IESO' : 'provincial'} energy efficiency rebates

## ⏱️ Time Estimation
- **Rough-in Phase**: ${Math.round(rough_in_hours / 8)} days (${rough_in_hours} hours)
- **Fixture Installation**: ${Math.round(fixture_install_hours / 8)} days (${fixture_install_hours} hours)
- **Final Connections**: ${Math.round(panel_final_hours / 8)} days (${panel_final_hours} hours)
- **Total**: ${Math.round(labor_hours / 8)} working days (${labor_hours} hours)

## 📋 Implementation Tips
- Schedule electrical rough-in after framing, before insulation
- Coordinate with HVAC and plumbing for shared wall penetrations
- Order materials 2 weeks in advance for best pricing
- Use local suppliers for faster delivery and better support
- Plan wire runs on paper first to minimize waste`;
            }
            
            if (trade === 'plumbing') {
              const fixtures = parseInt(details?.plumbingFixtures || String(Math.round(bathrooms * 3)));
              const waterHeater = details?.waterHeater || '50 gal';
              
              // Calculate base materials with proper breakdown
              const pex_feet = Math.round(sqft * 0.6);
              const copper_feet = Math.round(sqft * 0.3);
              const pex_cost = Math.round(pex_feet * 0.45);
              const copper_cost = Math.round(copper_feet * 3.20);
              const fittings_cost = Math.round((pex_cost + copper_cost) * 0.25);
              const piping_total = pex_cost + copper_cost + fittings_cost;
              
              const toilets_cost = Math.round(bathrooms * 250);
              const sinks_cost = Math.round(bathrooms * 1.5 * 180);
              const showers_cost = Math.round(bathrooms * 450);
              const faucets_cost = Math.round(fixtures * 0.8 * 85);
              const fixtures_total = toilets_cost + sinks_cost + showers_cost + faucets_cost;
              
              const water_heater_cost = waterHeater.includes('tankless') ? 2500 : Math.round(parseInt(waterHeater) * 25);
              const heater_kit = 200;
              const water_heater_total = water_heater_cost + heater_kit;
              
              const drain_feet = Math.round(bathrooms * 25);
              const vent_feet = Math.round(bathrooms * 15);
              const drains_vents_total = Math.round((drain_feet + vent_feet) * 2.50);
              
              const supply_feet = Math.round(sqft * 0.4);
              const supply_total = Math.round(supply_feet * 1.20);
              
              const base_materials = piping_total + fixtures_total + water_heater_total + drains_vents_total + supply_total;
              const materials_adjusted = Math.round(base_materials * costMultiplier);
              
              const laborHours = Math.round((bathrooms * 12) + (fixtures * 1.5) + 25);
              const labor = Math.round(laborHours * laborRate);
              const total = materials_adjusted + labor;
              const savings = Math.round(total * 0.15);
              
              return `# Plumbing Work - Detailed Estimate
## Location: ${details?.city || 'City'}, ${province}

## Project Specifications
- **Square Footage**: ${sqft} sq ft
- **Bathrooms**: ${bathrooms}
- **Plumbing Fixtures**: ${fixtures} fixtures
- **Water Heater**: ${waterHeater}
- **Sewer Connection**: ${details?.sewerConnection || 'Municipal'}
- **Water Supply**: ${details?.waterSupply || 'Municipal'}
- **Province**: ${province} (Cost adjustment: ${costMultiplier > 1 ? '+' : ''}${Math.round((costMultiplier - 1) * 100)}% vs national average)

## Cost Breakdown

### Materials: $${materials_adjusted.toLocaleString()} ${costMultiplier !== 1.0 ? `(adjusted for ${province} pricing)` : ''}

#### Piping & Fittings: $${piping_total.toLocaleString()}
- **PEX piping**: ${pex_feet} feet × $0.45/ft = **$${pex_cost.toLocaleString()}**
- **Copper for hot water**: ${copper_feet} feet × $3.20/ft = **$${copper_cost.toLocaleString()}**
- **Fittings & connectors**: **$${fittings_cost.toLocaleString()}**
- **Subtotal**: $${piping_total.toLocaleString()}

#### Fixtures: $${fixtures_total.toLocaleString()}
- **Toilets**: ${Math.round(bathrooms)} × $250 = **$${toilets_cost.toLocaleString()}**
- **Sinks**: ${Math.round(bathrooms * 1.5)} × $180 = **$${sinks_cost.toLocaleString()}**
- **Showers/Tubs**: ${Math.round(bathrooms)} × $450 = **$${showers_cost.toLocaleString()}**
- **Faucets**: **$${faucets_cost.toLocaleString()}**
- **Subtotal**: $${fixtures_total.toLocaleString()}

#### Water Heater: $${water_heater_total.toLocaleString()}
- **${waterHeater} ${waterHeater.includes('tankless') ? 'tankless' : 'tank'}**: **$${water_heater_cost.toLocaleString()}**
- **Installation kit**: **$${heater_kit.toLocaleString()}**
- **Subtotal**: $${water_heater_total.toLocaleString()}

#### Drains & Vents: $${drains_vents_total.toLocaleString()}
- **PVC drain lines**: ${drain_feet} feet
- **Vent stacks**: ${vent_feet} feet
- **Subtotal**: $${drains_vents_total.toLocaleString()}

#### Water Supply Lines: $${supply_total.toLocaleString()}
- **Main supply line**: ${supply_feet} feet
- **Subtotal**: $${supply_total.toLocaleString()}

**Materials Total: $${materials_adjusted.toLocaleString()}** ${costMultiplier !== 1.0 ? `(Base: $${base_materials.toLocaleString()} × ${costMultiplier.toFixed(2)})` : ''}

### Labor: $${labor.toLocaleString()}
- **Total Hours**: ${laborHours} hours @ $${laborRate}/hour (${province} rates)
- **Rough-in Plumbing**: ${Math.round(laborHours * 0.45)} hours
- **Fixture Installation**: ${Math.round(laborHours * 0.35)} hours
- **Water Heater & Final Connections**: ${Math.round(laborHours * 0.20)} hours

### Total Plumbing Cost: $${total.toLocaleString()}
**Breakdown**: Materials $${materials_adjusted.toLocaleString()} + Labor $${labor.toLocaleString()} = **$${total.toLocaleString()}**

## 🏛️ ${province} Building Code Requirements

### Permits & Inspections Required:
- **Plumbing Permit**: Required for all plumbing work
- **Rough-in Inspection**: Before covering pipes
- **Final Inspection**: Before occupancy
- **Estimated Permit Cost**: ${provinceCode.permitCost}

### Code Compliance Requirements:
- **Water Supply**: Must meet ${province} water quality standards
- **Drainage**: Must comply with NBC Part 7 (Plumbing)
- **Venting**: Proper vent stack requirements
- **Backflow Prevention**: Required for cross-connections
- **Water Efficiency**: ${province === 'BC' ? 'BC Plumbing Code' : province === 'ON' ? 'Ontario Building Code' : 'NBC'} requirements

### ${province}-Specific Requirements:
${province === 'BC' ? '- BC Plumbing Code compliance\n- Higher water efficiency standards\n- Seismic bracing requirements' :
province === 'ON' ? '- Ontario Building Code compliance\n- Must use licensed plumber\n- Tarion warranty requirements' :
province === 'QC' ? '- RBQ plumbing permit required\n- Must use master plumber\n- French documentation may be required' :
province === 'AB' ? '- Safety Codes Council inspection\n- Must use licensed plumber\n- Freeze protection requirements' :
'- Follow National Building Code of Canada\n- Provincial amendments may apply\n- Check with local building department'}

## 💰 Money-Saving Opportunities (Save $${savings.toLocaleString()})

1. **Tankless Water Heater** - Save $${Math.round(savings * 0.29).toLocaleString()}
   - More efficient long-term (save $200/year on energy)
   - Takes less space
   - Longer lifespan (20+ years vs 10-12)

2. **PEX vs Copper Piping** - Save $${Math.round(savings * 0.43).toLocaleString()}
   - PEX costs 60% less than copper
   - Faster installation (saves labor)
   - More flexible, fewer fittings needed
   - Better freeze resistance

3. **Efficient Fixture Selection** - Save $${Math.round(savings * 0.19).toLocaleString()}
   - Choose WaterSense certified fixtures
   - Lower water bills long-term
   - May qualify for rebates

4. **Group Plumbing Runs** - Save $${Math.round(savings * 0.09).toLocaleString()}
   - Design bathrooms back-to-back
   - Share supply and drain lines
   - Reduces material and labor

## ⏱️ Time Estimation
- **Rough-in Phase**: ${Math.round(laborHours * 0.45 / 8)} days
- **Fixture Installation**: ${Math.round(laborHours * 0.35 / 8)} days
- **Final Connections**: ${Math.round(laborHours * 0.20 / 8)} days
- **Total**: ${Math.round(laborHours / 8)} working days

## 📋 Implementation Tips
- Install plumbing before electrical in shared walls
- Use PEX for most runs, copper only for hot water main
- Schedule water heater installation during rough-in
- Coordinate with electrical for water heater circuit`;
            }
            
            if (trade === 'carpentry') {
              const rooms = parseInt(details?.rooms || String(Math.round(bedrooms + 3)));
              const doors = parseInt(details?.doors || String(Math.round(rooms * 1.5)));
              const windows = parseInt(details?.windows || String(Math.round(sqft / 130)));
              
              // Calculate base materials
              // Calculate base materials with proper breakdown
              const studs_2x4_feet = Math.round(sqft * 1.2);
              const studs_2x6_feet = Math.round(sqft * 0.4);
              const studs_2x4_cost = Math.round(studs_2x4_feet * 3.50);
              const studs_2x6_cost = Math.round(studs_2x6_feet * 5.20);
              const plates_headers = Math.round((studs_2x4_cost + studs_2x6_cost) * 0.23);
              const framing_total = studs_2x4_cost + studs_2x6_cost + plates_headers;
              
              const osb_sqft = Math.round(sqft * 1.1);
              const plywood_sqft = Math.round(sqft * 1.0);
              const osb_cost = Math.round(osb_sqft * 0.85);
              const plywood_cost = Math.round(plywood_sqft * 1.20);
              const sheathing_total = osb_cost + plywood_cost;
              
              const interior_doors_cost = (doors - 1) * 250; // -1 for exterior door
              const exterior_door_cost = 800;
              const windows_cost = windows * 380;
              const doors_windows_total = interior_doors_cost + exterior_door_cost + windows_cost;
              
              const baseboard_feet = Math.round(sqft * 0.4);
              const casing_feet = Math.round((doors + windows) * 12);
              const crown_feet = Math.round(sqft * 0.3);
              const trim_total = Math.round((baseboard_feet + casing_feet + crown_feet) * 2.50);
              
              const kitchen_cabinets = Math.round(sqft * 0.15 * 120);
              const bath_vanities = Math.round(parseFloat(details?.bathrooms || '2.5') * 600);
              const cabinets_total = kitchen_cabinets + bath_vanities;
              
              const hardware_fasteners = Math.round((framing_total + sheathing_total) * 0.08);
              
              const base_materials = framing_total + sheathing_total + doors_windows_total + trim_total + cabinets_total + hardware_fasteners;
              const materials_adjusted = Math.round(base_materials * costMultiplier);
              
              const laborHours = Math.round((sqft * 0.08) + (doors * 2) + (windows * 1.5) + 40);
              const labor = Math.round(laborHours * laborRate);
              const total = materials_adjusted + labor;
              const savings = Math.round(total * 0.18);
              
              return `# Carpentry Work - Detailed Estimate
## Location: ${details?.city || 'City'}, ${province}

## Project Specifications
- **Square Footage**: ${sqft} sq ft
- **Rooms**: ${rooms} rooms
- **Doors**: ${doors} doors
- **Windows**: ${windows} windows
- **Flooring**: ${details?.flooring || 'Hardwood, Tile, Carpet'}
- **Cabinets**: ${details?.cabinets || 'Kitchen + Bath'}
- **Province**: ${province} (Cost adjustment: ${costMultiplier > 1 ? '+' : ''}${Math.round((costMultiplier - 1) * 100)}% vs national average)

## Cost Breakdown

### Materials: $${materials_adjusted.toLocaleString()} ${costMultiplier !== 1.0 ? `(adjusted for ${province} pricing)` : ''}

#### Framing Lumber: $${framing_total.toLocaleString()}
- **2x4 studs**: ${studs_2x4_feet} linear feet × $3.50/ft = **$${studs_2x4_cost.toLocaleString()}**
- **2x6 for exterior walls**: ${studs_2x6_feet} linear feet × $5.20/ft = **$${studs_2x6_cost.toLocaleString()}**
- **Plates & headers**: **$${plates_headers.toLocaleString()}**
- **Subtotal**: $${framing_total.toLocaleString()}

#### Sheathing & Subfloor: $${sheathing_total.toLocaleString()}
- **OSB sheathing**: ${osb_sqft} sq ft × $0.85/sqft = **$${osb_cost.toLocaleString()}**
- **Plywood subfloor**: ${plywood_sqft} sq ft × $1.20/sqft = **$${plywood_cost.toLocaleString()}**
- **Subtotal**: $${sheathing_total.toLocaleString()}

#### Doors & Windows: $${doors_windows_total.toLocaleString()}
- **Interior doors**: ${doors - 1} × $250 = **$${interior_doors_cost.toLocaleString()}**
- **Exterior door**: 1 × $800 = **$${exterior_door_cost.toLocaleString()}**
- **Windows**: ${windows} × $380 = **$${windows_cost.toLocaleString()}**
- **Subtotal**: $${doors_windows_total.toLocaleString()}

#### Trim & Molding: $${trim_total.toLocaleString()}
- **Baseboards**: ${baseboard_feet} linear feet
- **Casing**: ${casing_feet} linear feet
- **Crown molding**: ${crown_feet} linear feet
- **Subtotal**: $${trim_total.toLocaleString()}

#### Cabinets: $${cabinets_total.toLocaleString()}
- **Kitchen cabinets**: **$${kitchen_cabinets.toLocaleString()}**
- **Bathroom vanities**: **$${bath_vanities.toLocaleString()}**
- **Subtotal**: $${cabinets_total.toLocaleString()}

#### Hardware & Fasteners: $${hardware_fasteners.toLocaleString()}
- Nails, screws, brackets, etc.
- **Subtotal**: $${hardware_fasteners.toLocaleString()}

**Materials Total: $${materials_adjusted.toLocaleString()}** ${costMultiplier !== 1.0 ? `(Base: $${base_materials.toLocaleString()} × ${costMultiplier.toFixed(2)})` : ''}

### Labor: $${labor.toLocaleString()}
- **Total Hours**: ${laborHours} hours @ $${laborRate}/hour (${province} rates)
- **Framing**: ${Math.round(laborHours * 0.40)} hours
- **Door & Window Installation**: ${Math.round(laborHours * 0.25)} hours
- **Trim & Finish Work**: ${Math.round(laborHours * 0.35)} hours

### Total Carpentry Cost: $${total.toLocaleString()}
**Breakdown**: Materials $${materials_adjusted.toLocaleString()} + Labor $${labor.toLocaleString()} = **$${total.toLocaleString()}**

## 🏛️ ${province} Building Code Requirements

### Permits & Inspections Required:
- **Building Permit**: Required for structural work
- **Framing Inspection**: Before insulation
- **Final Inspection**: Before occupancy
- **Estimated Permit Cost**: ${provinceCode.permitCost}

### Code Compliance Requirements:
- **Structural**: Must meet NBC Part 4 (Structural Design)
- **Fire Separation**: Required fire ratings between units
- **Wind Load**: ${province === 'BC' ? 'Higher wind loads on coast' : province === 'AB' ? 'Consider wind exposure' : 'Standard NBC requirements'}
- **Snow Load**: ${province === 'BC' || province === 'QC' || province === 'ON' ? 'Higher snow loads in some areas' : 'Standard NBC requirements'}
- **Insulation**: R-value requirements per ${provinceCode.energyCode}

### ${province}-Specific Requirements:
${province === 'BC' ? '- BC Building Code compliance\n- Higher seismic requirements\n- Energy Step Code requirements' :
province === 'ON' ? '- Ontario Building Code compliance\n- Tarion warranty for new homes\n- Higher insulation requirements' :
province === 'QC' ? '- RBQ building permit required\n- French documentation may be required\n- Higher snow load requirements' :
province === 'AB' ? '- Safety Codes Council inspection\n- Consider freeze-thaw cycles\n- Higher wind requirements in some areas' :
'- Follow National Building Code of Canada\n- Provincial amendments may apply\n- Check with local building department'}

## 💰 Money-Saving Opportunities (Save $${savings.toLocaleString()})

1. **Pre-fabricated Trusses** - Save $${Math.round(savings * 0.29).toLocaleString()}
   - Factory-built trusses save 30% on labor
   - Faster installation
   - More consistent quality
   - Better engineering

2. **Bulk Lumber Purchase** - Save $${Math.round(savings * 0.25).toLocaleString()}
   - Order all lumber at once for volume discount
   - Reduces waste with better planning
   - Lock in prices early

3. **Standard Door & Window Sizes** - Save $${Math.round(savings * 0.13).toLocaleString()}
   - Custom sizes cost 40% more
   - Standard sizes readily available
   - Faster installation

4. **Efficient Cutting Plans** - Save $${Math.round(savings * 0.33).toLocaleString()}
   - Plan cuts to minimize waste
   - Use software for optimization
   - Reuse offcuts where possible
   - Can reduce material waste by 15%

## ⏱️ Time Estimation
- **Framing Phase**: ${Math.round(laborHours * 0.40 / 8)} days
- **Door & Window Installation**: ${Math.round(laborHours * 0.25 / 8)} days
- **Trim & Finish Work**: ${Math.round(laborHours * 0.35 / 8)} days
- **Total**: ${Math.round(laborHours / 8)} working days

## 📋 Implementation Tips
- Frame exterior walls first, then interior
- Install windows and doors before insulation
- Use pre-hung doors to save time
- Order materials 3 weeks in advance
- Schedule trim work after drywall and paint`;
            }
          }
          
          // Default all-trades estimate
          return `# Construction Estimate Analysis

## Project Cost Breakdown
- **Total Project Cost**: $278,241 CAD
- **Materials**: $153,300 (55%)
- **Labor**: $68,040 (25%) 
- **Contractor Markup**: $33,201 (12%)
- **Miscellaneous**: $23,700 (8%)

## Trade Breakdown

### ⚡ Electrical Work: $30,900
- Materials: $18,500
- Labor: $12,400 (80 hours)
- **Savings Opportunity**: $5,200

### 🚿 Plumbing Work: $28,000
- Materials: $12,800
- Labor: $15,200 (95 hours)
- **Savings Opportunity**: $4,200

### 🔨 Carpentry Work: $62,800
- Materials: $34,200
- Labor: $28,600 (160 hours)
- **Savings Opportunity**: $11,200

## Identified Savings Opportunities
1. **Local Material Sourcing**: Save $8,500
2. **Seasonal Construction Timing**: Save $15,000
3. **Energy Efficiency Rebates**: Save $6,200
4. **Value Engineering**: Save $18,500
5. **Owner-Supplied Items**: Save $9,200

**Total Potential Savings: $57,400**
**Optimized Project Cost: $220,841**

## Implementation Timeline
- **Foundation**: 3 weeks (April-May)
- **Framing & Envelope**: 6 weeks (May-June)
- **Mechanicals**: 4 weeks (July)
- **Interior Finishing**: 5 weeks (August)
- **Final**: 1 week (September)

**Total Timeline: 19 weeks**`;
        })()
      },
      trucking: {
        fleet: `# Fleet Optimization Analysis

## Current Performance
- **Monthly Fuel Cost**: $22,000
- **Maintenance Cost**: $6,500
- **Empty Miles**: 30%
- **Total Monthly Operating Cost**: $35,500

## Optimization Recommendations
1. **Route Optimization**: 15% fuel savings = $3,300/month
2. **Predictive Maintenance**: 25% maintenance savings = $1,625/month
3. **Load Matching**: 35% empty miles reduction = $2,310/month
4. **Driver Training**: 8% efficiency improvement = $1,760/month

## 3-Year Financial Projection
- **Year 1 Savings**: $100,320
- **Year 2 Savings**: $122,400
- **Year 3 Savings**: $138,000
- **Total 3-Year Savings**: $360,720

## ROI Analysis
- **Investment Required**: $146,000
- **Break-even**: 14 months
- **3-Year ROI**: 221%`
      },
      restaurant: {
        inventory: `# Restaurant Optimization Analysis

## Current Metrics
- **Food Cost**: 35% of revenue
- **Waste**: 12% of food purchases  
- **Monthly Food Cost**: $28,000
- **Monthly Waste**: $3,360

## Optimization Strategy
1. **Inventory Management**: Reduce waste to 6% = $1,680 savings
2. **Supplier Consolidation**: 8% cost reduction = $2,240 savings
3. **Menu Engineering**: Improve margins by 5% = $4,000 savings
4. **Portion Control**: 3% food cost reduction = $840 savings

## Results
- **Optimized Food Cost**: 30% of revenue
- **Total Monthly Savings**: $8,760
- **Annual Savings**: $105,120

## Implementation Timeline
- **Week 1**: Install tracking systems
- **Month 1**: Renegotiate supplier contracts
- **Quarter 1**: Achieve 30% food cost target`
      }
    };

    // Handle three-tier estimate generation
    if (generateThreeOptions && businessType === 'construction' && optimizationType === 'estimate') {
      const { trade } = body;
      const sqft = parseInt(details?.squareFootage || '2000');
      const province = details?.province || 'ON';
      const city = details?.city || 'City';
      const constructionType = details?.constructionType || 'new';
      const projectDescription = (details?.projectDescription || '').toLowerCase();
      const selectedTrades = (trade || 'all').split(',').filter((t: string) => t && t !== 'all');
      const allTrades = selectedTrades.length === 0 ? ['electrical', 'plumbing', 'carpentry', 'framing', 'drywall', 'hvac', 'roofing', 'flooring', 'concrete', 'general'] : selectedTrades;
      
      // Detect project type from description and adjust defaults intelligently
      const isGarage = projectDescription.includes('garage') || sqft < 800;
      const isSuite = projectDescription.includes('suite') || projectDescription.includes('apartment');
      const isCommercial = projectDescription.includes('commercial') || projectDescription.includes('office');
      
      // Only use bedrooms/bathrooms if it's a residential living space (not garage)
      let bedrooms = 0;
      let bathrooms = 0;
      let projectTypeLabel = '';
      
      if (isGarage) {
        bedrooms = 0;
        bathrooms = 0;
        projectTypeLabel = `${sqft} sq ft Garage`;
      } else if (isSuite) {
        bedrooms = parseInt(details?.bedrooms || String(Math.max(1, Math.floor(sqft / 400))));
        bathrooms = parseFloat(details?.bathrooms || String(Math.max(1, Math.floor(sqft / 500))));
        projectTypeLabel = `${sqft} sq ft Suite (${bedrooms} bed, ${bathrooms} bath)`;
      } else {
        bedrooms = parseInt(details?.bedrooms || String(Math.max(1, Math.floor(sqft / 500))));
        bathrooms = parseFloat(details?.bathrooms || String(Math.max(1, Math.floor(sqft / 600))));
        projectTypeLabel = `${sqft} sq ft ${constructionType === 'new' ? 'Home' : constructionType === 'renovation' ? 'Renovation' : 'Addition'} (${bedrooms} bed, ${bathrooms} bath)`;
      }
      
      const provinceMultipliers: Record<string, number> = {
        'AB': 1.0, 'BC': 1.15, 'MB': 0.95, 'NB': 0.92, 'NL': 1.05,
        'NS': 0.98, 'NT': 1.25, 'NU': 1.30, 'ON': 1.10, 'PE': 0.95,
        'QC': 1.05, 'SK': 0.93, 'YT': 1.20
      };
      
      const costMultiplier = provinceMultipliers[province] || 1.0;
      const baseLaborRate = 155;
      const laborRate = Math.round(baseLaborRate * costMultiplier);
      
      // Determine which trades are included for permit calculations
      const hasElectrical = allTrades.includes('electrical');
      const hasPlumbing = allTrades.includes('plumbing');
      
      // Calculate realistic permit fees based on province and project value
      const calculatePermitFees = (projectValue: number, province: string, hasElectrical: boolean, hasPlumbing: boolean) => {
        let buildingPermit = 0;
        let electricalPermit = 0;
        let plumbingPermit = 0;
        
        // Building permit: typically $5-$9 per $1000 of project value
        const permitRate = province === 'NL' ? 7 : province === 'BC' ? 8 : province === 'ON' ? 7.5 : 6.5;
        buildingPermit = Math.round((projectValue / 1000) * permitRate);
        buildingPermit = Math.max(buildingPermit, 200); // Minimum $200
        
        // Electrical permit: $50-$150
        if (hasElectrical) {
          electricalPermit = province === 'NL' ? 100 : province === 'BC' ? 120 : province === 'ON' ? 110 : 80;
        }
        
        // Plumbing permit: $50-$150
        if (hasPlumbing) {
          plumbingPermit = province === 'NL' ? 100 : province === 'BC' ? 120 : province === 'ON' ? 110 : 80;
        }
        
        return buildingPermit + electricalPermit + plumbingPermit;
      };
      
      // Generate quote number and dates
      const quoteNumber = `EST-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const quoteDate = new Date().toLocaleDateString('en-CA');
      const quoteExpirationDays = parseInt(details?.quoteValidity || '90');
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + quoteExpirationDays);
      const expirationDateStr = expirationDate.toLocaleDateString('en-CA');
      
      // Company information (can be customized)
      const companyName = details?.companyName || 'Your Construction Company';
      const companyAddress = details?.companyAddress || '123 Main Street, City, Province';
      const companyPhone = details?.companyPhone || '(555) 123-4567';
      const companyEmail = details?.companyEmail || 'info@company.com';
      const companyLicense = details?.companyLicense || 'License #12345';
      const estimatorName = details?.estimatorName || 'Estimator Name';
      
      // Client information
      const clientName = details?.clientName || details?.projectName || 'Client Name';
      const clientAddress = details?.clientAddress || `${city}, ${province}`;
      const projectAddress = details?.projectAddress || `${city}, ${province}`;
      
      // Generate three estimate options
      const generateEstimateOption = (tier: 'budget' | 'value' | 'premium') => {
        // Formulaic material multipliers: Budget 1.0, Value 1.25, Premium 1.50
        const materialMultiplier = tier === 'budget' ? 1.0 : tier === 'value' ? 1.25 : 1.50;
        const laborMultiplier = tier === 'budget' ? 0.85 : tier === 'value' ? 1.0 : 1.15;
        const quality = tier === 'budget' ? 'Basic' : tier === 'value' ? 'Standard' : 'Premium';
        
        // Calculate effective labor rate for this tier (for display)
        const effectiveLaborRate = Math.round(laborRate * laborMultiplier);
        
        // Timeline multiplier: Premium takes longer due to higher quality work
        const timelineMultiplier = tier === 'budget' ? 1.0 : tier === 'value' ? 1.1 : 1.25;
        
        // Overhead and profit percentages (configurable)
        const overheadPercent = parseFloat(details?.overheadPercent || '12');
        const profitPercent = parseFloat(details?.profitPercent || '10');
        
        let totalMaterials = 0;
        let totalLabor = 0;
        let totalHours = 0;
        const tradeBreakdowns: string[] = [];
        const riskFlags: string[] = [];
        const upsells: string[] = [];
        const savings: string[] = [];
        const csiLineItems: string[] = [];
        
        // Track panel size for material specs (declare outside loop)
        let panelAmps = 200;
        
        // Generate estimates for each trade
        allTrades.forEach((trade: string) => {
          if (trade === 'electrical') {
            // For garage, fewer outlets and fixtures needed
            const outlets = isGarage 
              ? parseInt(details?.electricalOutlets || String(Math.max(4, Math.round(sqft / 100))))
              : parseInt(details?.electricalOutlets || String(Math.round(sqft / 50)));
            const fixtures = isGarage
              ? parseInt(details?.lightFixtures || String(Math.max(4, Math.round(sqft / 150))))
              : parseInt(details?.lightFixtures || String(Math.round(sqft / 80)));
            // For garage, use smaller panel (60-100A subpanel); for house, use specified or 200A
            panelAmps = isGarage 
              ? Math.min(Math.max(parseInt(details?.panelSize || '60'), 60), 100)
              : Math.max(parseInt(details?.panelSize || '200'), 200);
            const panelLabel = isGarage ? `${panelAmps}A subpanel` : `${panelAmps}A service`;
            
            // Garage electrical is much simpler - basic wiring, no complex circuits
            const baseMaterialsPerSqft = isGarage ? 6 : 12; // Garage: $6/sq ft, House: $12/sq ft
            const baseMaterials = Math.round(sqft * baseMaterialsPerSqft * materialMultiplier);
            const baseLaborHours = isGarage 
              ? Math.round(outlets * 0.3 + fixtures * 0.5 + 15) // Simpler for garage
              : Math.round(outlets * 0.5 + fixtures * 0.8 + 25);
            const materials = Math.round(baseMaterials * costMultiplier);
            const labor = Math.round(baseLaborHours * effectiveLaborRate);
            
            totalMaterials += materials;
            totalLabor += labor;
            totalHours += baseLaborHours;
            
            tradeBreakdowns.push(`### ⚡ Electrical: $${(materials + labor).toLocaleString()}
- Materials: $${materials.toLocaleString()} (${quality} grade)
- Labor: $${labor.toLocaleString()} (${baseLaborHours} hours)
- Panel: ${panelLabel}
- Outlets: ${outlets}, Fixtures: ${fixtures}`);
          } else if (trade === 'plumbing') {
            // For garage, use minimal plumbing; for residential, use bathrooms
            const fixtures = isGarage ? 1 : parseInt(details?.plumbingFixtures || String(Math.round(bathrooms * 3)));
            const baseMaterials = isGarage ? Math.round(sqft * 2 * materialMultiplier) : Math.round(sqft * 8 * materialMultiplier);
            const baseLaborHours = isGarage ? Math.round(8) : Math.round(fixtures * 2.5 + 20);
            const materials = Math.round(baseMaterials * costMultiplier);
            const labor = Math.round(baseLaborHours * effectiveLaborRate);
            
            totalMaterials += materials;
            totalLabor += labor;
            totalHours += baseLaborHours;
            
            tradeBreakdowns.push(`### 🚿 Plumbing: $${(materials + labor).toLocaleString()}
- Materials: $${materials.toLocaleString()} (${quality} grade)
- Labor: $${labor.toLocaleString()} (${baseLaborHours} hours)
- Fixtures: ${fixtures}`);
          } else if (trade === 'carpentry') {
            const rooms = parseInt(details?.rooms || String(Math.round(sqft / 250)));
            // Garage carpentry is much simpler - basic framing, doors, maybe some shelving
            // No interior finishes, cabinets, trim work like a house
            const baseMaterialsPerSqft = isGarage ? 5 : 18; // Garage: $5/sq ft, House: $18/sq ft
            const baseMaterials = Math.round(sqft * baseMaterialsPerSqft * materialMultiplier);
            const baseLaborHours = isGarage
              ? Math.round(rooms * 4 + 20) // Simpler work for garage
              : Math.round(rooms * 8 + 30);
            const materials = Math.round(baseMaterials * costMultiplier);
            const labor = Math.round(baseLaborHours * effectiveLaborRate);
            
            totalMaterials += materials;
            totalLabor += labor;
            totalHours += baseLaborHours;
            
            // For garage, use "Bays" instead of "Rooms"
            const roomLabel = isGarage ? `Bays: ${rooms}` : `Rooms: ${rooms}`;
            
            tradeBreakdowns.push(`### 🔨 Carpentry: $${(materials + labor).toLocaleString()}
- Materials: $${materials.toLocaleString()} (${quality} grade)
- Labor: $${labor.toLocaleString()} (${baseLaborHours} hours)
- ${roomLabel}`);
          } else if (trade === 'framing') {
            // Garage framing is simpler - no interior walls, simpler structure
            const baseMaterialsPerSqft = isGarage ? 4 : 6; // Garage: $4/sq ft, House: $6/sq ft
            const baseMaterials = Math.round(sqft * baseMaterialsPerSqft * materialMultiplier);
            const baseLaborHours = isGarage
              ? Math.round(sqft / 20) // Faster for simple garage framing
              : Math.round(sqft / 15);
            const materials = Math.round(baseMaterials * costMultiplier);
            const labor = Math.round(baseLaborHours * effectiveLaborRate);
            
            totalMaterials += materials;
            totalLabor += labor;
            totalHours += baseLaborHours;
            
            tradeBreakdowns.push(`### 🏗️ Framing: $${(materials + labor).toLocaleString()}
- Materials: $${materials.toLocaleString()} (${quality} grade)
- Labor: $${labor.toLocaleString()} (${baseLaborHours} hours)`);
          } else if (trade === 'drywall') {
            // Many garages don't have drywall, or only partial
            // If included, it's usually unfinished/unpainted
            const baseMaterialsPerSqft = isGarage ? 1.5 : 2.5; // Garage: $1.5/sq ft (if any), House: $2.5/sq ft
            const baseMaterials = Math.round(sqft * baseMaterialsPerSqft * materialMultiplier);
            const baseLaborHours = isGarage
              ? Math.round(sqft / 35) // Faster, no finishing
              : Math.round(sqft / 25);
            const materials = Math.round(baseMaterials * costMultiplier);
            const labor = Math.round(baseLaborHours * effectiveLaborRate);
            
            totalMaterials += materials;
            totalLabor += labor;
            totalHours += baseLaborHours;
            
            tradeBreakdowns.push(`### 🧱 Drywall: $${(materials + labor).toLocaleString()}
- Materials: $${materials.toLocaleString()} (${quality} grade)
- Labor: $${labor.toLocaleString()} (${baseLaborHours} hours)`);
          } else if (trade === 'hvac') {
            const baseMaterials = Math.round(sqft * 15 * materialMultiplier);
            const baseLaborHours = Math.round(sqft / 20);
            const materials = Math.round(baseMaterials * costMultiplier);
            const labor = Math.round(baseLaborHours * effectiveLaborRate);
            
            totalMaterials += materials;
            totalLabor += labor;
            totalHours += baseLaborHours;
            
            tradeBreakdowns.push(`### ❄️ HVAC: $${(materials + labor).toLocaleString()}
- Materials: $${materials.toLocaleString()} (${quality} grade)
- Labor: $${labor.toLocaleString()} (${baseLaborHours} hours)`);
          } else if (trade === 'roofing') {
            const roofSqft = Math.round(sqft * 1.2); // Account for pitch
            // Garage roofing is simpler - basic shingles, no complex valleys
            const baseMaterialsPerSqft = isGarage ? 3 : 4; // Garage: $3/sq ft, House: $4/sq ft
            const baseMaterials = Math.round(roofSqft * baseMaterialsPerSqft * materialMultiplier);
            const baseLaborHours = isGarage
              ? Math.round(roofSqft / 35) // Simpler roof structure
              : Math.round(roofSqft / 30);
            const materials = Math.round(baseMaterials * costMultiplier);
            const labor = Math.round(baseLaborHours * effectiveLaborRate);
            
            totalMaterials += materials;
            totalLabor += labor;
            totalHours += baseLaborHours;
            
            tradeBreakdowns.push(`### 🏠 Roofing: $${(materials + labor).toLocaleString()}
- Materials: $${materials.toLocaleString()} (${quality} grade)
- Labor: $${labor.toLocaleString()} (${baseLaborHours} hours)`);
          } else if (trade === 'flooring') {
            const baseMaterials = Math.round(sqft * 5 * materialMultiplier);
            const baseLaborHours = Math.round(sqft / 40);
            const materials = Math.round(baseMaterials * costMultiplier);
            const labor = Math.round(baseLaborHours * effectiveLaborRate);
            
            totalMaterials += materials;
            totalLabor += labor;
            totalHours += baseLaborHours;
            
            tradeBreakdowns.push(`### 🪵 Flooring: $${(materials + labor).toLocaleString()}
- Materials: $${materials.toLocaleString()} (${quality} grade)
- Labor: $${labor.toLocaleString()} (${baseLaborHours} hours)`);
          } else if (trade === 'concrete') {
            // Concrete is similar for garage and house (slab foundation)
            const baseMaterialsPerSqft = isGarage ? 2.5 : 3; // Garage: $2.5/sq ft, House: $3/sq ft
            const baseMaterials = Math.round(sqft * baseMaterialsPerSqft * materialMultiplier);
            const baseLaborHours = Math.round(sqft / 50);
            const materials = Math.round(baseMaterials * costMultiplier);
            const labor = Math.round(baseLaborHours * effectiveLaborRate);
            
            totalMaterials += materials;
            totalLabor += labor;
            totalHours += baseLaborHours;
            
            tradeBreakdowns.push(`### 🏗️ Concrete/Excavation: $${(materials + labor).toLocaleString()}
- Materials: $${materials.toLocaleString()} (${quality} grade)
- Labor: $${labor.toLocaleString()} (${baseLaborHours} hours)`);
          } else if (trade === 'general') {
            const baseMaterials = Math.round((totalMaterials * 0.1) * materialMultiplier);
            const baseLaborHours = Math.round(totalHours * 0.15);
            const materials = Math.round(baseMaterials * costMultiplier);
            const labor = Math.round(baseLaborHours * effectiveLaborRate);
            
            totalMaterials += materials;
            totalLabor += labor;
            totalHours += baseLaborHours;
            
            tradeBreakdowns.push(`### 👷 General Contracting: $${(materials + labor).toLocaleString()}
- Materials: $${materials.toLocaleString()}
- Labor: $${labor.toLocaleString()} (${baseLaborHours} hours)
- Project Management & Coordination`);
          }
        });
        
        // Calculate trade subtotal for transparency
        const tradeSubtotal = totalMaterials + totalLabor;
        
        // Calculate realistic permit fees
        const permits = calculatePermitFees(tradeSubtotal, province, hasElectrical, hasPlumbing);
        
        const equipment = Math.round(tradeSubtotal * 0.03);
        const waste = Math.round(totalMaterials * 0.05);
        const contingency = tier === 'budget' ? Math.round(tradeSubtotal * 0.05) : 
                           tier === 'value' ? Math.round(tradeSubtotal * 0.08) : 
                           Math.round(tradeSubtotal * 0.10);
        
        const additionalCosts = permits + equipment + waste + contingency;
        
        // Calculate overhead and profit (separate from direct costs)
        const directCosts = tradeSubtotal + additionalCosts;
        const overhead = Math.round(directCosts * (overheadPercent / 100));
        const profit = Math.round((directCosts + overhead) * (profitPercent / 100));
        const totalCost = directCosts + overhead + profit;
        
        // Calculate timeline that matches labor hours, differentiated by tier
        const workers = parseInt(details?.numberOfWorkers || '2');
        const baseTimelineDays = Math.ceil(totalHours / (workers * 8));
        const timelineDays = Math.ceil(baseTimelineDays * timelineMultiplier);
        
        // Calculate start/end dates if provided
        let startDate = details?.preferredStartDate || '';
        let endDate = '';
        if (startDate) {
          const start = new Date(startDate);
          // Add working days (excluding weekends)
          let daysAdded = 0;
          let currentDate = new Date(start);
          while (daysAdded < timelineDays) {
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
              daysAdded++;
            }
          }
          endDate = currentDate.toISOString().split('T')[0];
        }
        
        // Risk flags
        if (constructionType !== 'new') {
          riskFlags.push('- Hidden issues behind walls (old wiring, plumbing, framing)');
        }
        if (details?.hazards?.includes('asbestos')) {
          riskFlags.push('- Asbestos abatement required (add $5,000-$15,000)');
        }
        if (details?.hazards?.includes('mold')) {
          riskFlags.push('- Mold remediation needed (add $3,000-$10,000)');
        }
        if (details?.hazards?.includes('water damage')) {
          riskFlags.push('- Water damage repair may exceed estimate');
        }
        if (details?.access === 'difficult' || details?.access === 'obstructed') {
          riskFlags.push('- Difficult access may increase labor time by 15-25%');
        }
        
        // Upsells - garage-specific vs residential
        if (isGarage) {
          if (tier === 'value' || tier === 'premium') {
            upsells.push('- Epoxy floor coating vs standard slab: +$2,000-$4,000');
            upsells.push('- Insulated garage door vs standard: +$800-$1,500');
            upsells.push('- Additional electrical outlets for workshop: +$500-$1,200');
          }
          if (tier === 'premium') {
            upsells.push('- Heated floor system: +$3,000-$6,000');
            upsells.push('- High-efficiency insulation upgrade: +$1,500-$3,000');
            upsells.push('- Smart garage door opener with app control: +$600-$1,200');
            upsells.push('- Extended warranty on door & opener: +$300-$600');
          }
        } else {
          if (tier === 'value' || tier === 'premium') {
            upsells.push('- Energy-efficient panel & fixtures: +$2,500-$4,000');
            upsells.push('- Better flooring (hardwood vs laminate): +$3,000-$8,000');
            upsells.push('- Mold-resistant drywall: +$1,500-$3,000');
          }
          if (tier === 'premium') {
            upsells.push('- Smart home package: +$5,000-$12,000');
            upsells.push('- Insulation improvements (R-value upgrade): +$2,000-$5,000');
            upsells.push('- Surge protection & whole-home backup: +$3,000-$6,000');
            upsells.push('- Extended warranty options: +$1,500-$3,000');
          }
        }
        
        // Money-saving options - scaled by project size
        const projectSizeFactor = sqft < 1000 ? 0.5 : sqft < 2000 ? 0.75 : 1.0;
        const bulkSavings = Math.round(totalMaterials * 0.08 * projectSizeFactor);
        const simplifiedSavings = Math.round(totalMaterials * 0.12 * projectSizeFactor);
        const fixtureSavings = Math.round(totalMaterials * 0.10 * projectSizeFactor);
        const coordinationSavings = Math.round(totalLabor * 0.15 * projectSizeFactor);
        const demoSavings = Math.round(totalLabor * 0.08 * projectSizeFactor);
        
        if (bulkSavings > 100) savings.push(`- Bulk material ordering: Save $${bulkSavings.toLocaleString()}`);
        if (simplifiedSavings > 100) savings.push(`- Simplified finishes: Save $${simplifiedSavings.toLocaleString()}`);
        if (fixtureSavings > 100) savings.push(`- Standard fixture packages: Save $${fixtureSavings.toLocaleString()}`);
        if (coordinationSavings > 100) savings.push(`- Running wire/pipe during framing: Save $${coordinationSavings.toLocaleString()}`);
        if (demoSavings > 100 && constructionType !== 'new') savings.push(`- Eliminating unnecessary demolition: Save $${demoSavings.toLocaleString()}`);
        
        const totalSavings = bulkSavings + simplifiedSavings + fixtureSavings + coordinationSavings + (constructionType !== 'new' ? demoSavings : 0);
        
        // Labor tiering breakdown - use effective rate for this tier
        const experienceLevel = details?.experienceLevel || 'journeyperson';
        let laborBreakdown = '';
        if (experienceLevel === 'apprentice') {
          const apprenticeHours = Math.round(totalHours * 0.6);
          const journeypersonHours = Math.round(totalHours * 0.4);
          const apprenticeRate = Math.round(effectiveLaborRate * 0.6);
          laborBreakdown = `- Apprentice: ${apprenticeHours} hours @ $${apprenticeRate}/hr = $${(apprenticeHours * apprenticeRate).toLocaleString()}\n- Journeyperson: ${journeypersonHours} hours @ $${effectiveLaborRate}/hr = $${(journeypersonHours * effectiveLaborRate).toLocaleString()}`;
        } else if (experienceLevel === 'red seal' || experienceLevel === 'master') {
          const masterHours = Math.round(totalHours * 0.3);
          const journeypersonHours = totalHours - masterHours;
          const masterRate = Math.round(effectiveLaborRate * 1.2);
          laborBreakdown = `- Master/Red Seal: ${masterHours} hours @ $${masterRate}/hr = $${(masterHours * masterRate).toLocaleString()}\n- Journeyperson: ${journeypersonHours} hours @ $${effectiveLaborRate}/hr = $${(journeypersonHours * effectiveLaborRate).toLocaleString()}`;
        } else {
          laborBreakdown = `- Journeyperson: ${totalHours} hours @ $${effectiveLaborRate}/hr`;
        }
        
        // Generate payment schedule based on timeline and project type
        const paymentMilestones = [];
        if (timelineDays > 0) {
          const milestone1 = Math.round(totalCost * 0.25); // Deposit
          const milestone2 = Math.round(totalCost * 0.25); // Progress
          const milestone3 = Math.round(totalCost * 0.25); // Progress
          const milestone4 = totalCost - milestone1 - milestone2 - milestone3; // Final
          
          // For short projects (< 1 week), use simpler payment schedule
          if (timelineDays <= 5) {
            paymentMilestones.push(
              { name: 'Deposit', description: 'Upon acceptance', percent: 50, amount: Math.round(totalCost * 0.5), due: 'Contract signing' },
              { name: 'Final Payment', description: 'Upon completion & inspection', percent: 50, amount: totalCost - Math.round(totalCost * 0.5), due: 'Project completion' }
            );
          } else {
            // For longer projects, use milestone-based payments
            const week1 = Math.ceil(timelineDays / 5 * 0.33);
            const week2 = Math.ceil(timelineDays / 5 * 0.67);
            const week3 = Math.ceil(timelineDays / 5);
            
            // Adjust milestone names based on project type
            const milestone2Name = isGarage ? 'Rough-in Complete' : allTrades.includes('framing') ? 'Framing Complete' : '50% Complete';
            const milestone3Name = allTrades.includes('drywall') ? 'Drywall Complete' : '75% Complete';
            
            paymentMilestones.push(
              { name: 'Deposit', description: 'Upon acceptance', percent: 25, amount: milestone1, due: 'Contract signing' },
              { name: milestone2Name, description: milestone2Name === 'Rough-in Complete' ? 'Electrical rough-in complete' : 'Framing & rough-in complete', percent: 25, amount: milestone2, due: week1 <= 1 ? 'Week 1' : `Week ${week1}` },
              { name: milestone3Name, description: milestone3Name === 'Drywall Complete' ? 'Drywall & paint complete' : '75% of work complete', percent: 25, amount: milestone3, due: week2 <= 1 ? 'Week 1' : `Week ${week2}` },
              { name: 'Final Payment', description: 'Completion & inspection', percent: 25, amount: milestone4, due: week3 <= 1 ? 'Week 1' : `Week ${week3}` }
            );
          }
        }
        
        // Generate exclusions based on project type
        const exclusions = [];
        if (isGarage) {
          exclusions.push('Landscaping', 'Driveway paving', 'Interior finishes (if applicable)', 'Appliances', 'Site preparation beyond standard');
        } else {
          exclusions.push('Landscaping', 'Driveway paving', 'Interior finishes (flooring, paint colors)', 'Appliances', 'Furniture', 'Window treatments');
        }
        if (details?.whoPullsPermits === 'homeowner') {
          exclusions.push('Permit fees (pulled by homeowner)');
        }
        exclusions.push('Utility connections beyond 10 feet', 'Hazardous material removal (if discovered)', 'Weather delays');
        
        // Generate assumptions
        const assumptions = [
          'Normal site access',
          'Standard soil conditions',
          'No hazardous materials present',
          'Client provides clear access during work hours',
          'Material availability as of estimate date',
          'No existing structural issues',
          details?.access === 'normal' ? 'Standard access conditions' : `${details?.access} access conditions`
        ];
        
        // Generate CSI MasterFormat line items
        if (hasElectrical) {
          const outlets = isGarage 
            ? parseInt(details?.electricalOutlets || String(Math.max(4, Math.round(sqft / 100))))
            : parseInt(details?.electricalOutlets || String(Math.round(sqft / 50)));
          const fixtures = isGarage
            ? parseInt(details?.lightFixtures || String(Math.max(4, Math.round(sqft / 150))))
            : parseInt(details?.lightFixtures || String(Math.round(sqft / 80)));
          const romex12 = Math.round(sqft * 0.8);
          const romex14 = Math.round(sqft * 0.5);
          const gfciCount = Math.round(outlets * 0.2);
          const standardCount = Math.round(outlets * 0.8);
          
          csiLineItems.push(`### Division 26 - Electrical
| CSI Code | Description | Quantity | Unit | Unit Cost | Extended |
|----------|-------------|----------|------|-----------|----------|
| 26 05 13 | 12/2 Romex wire | ${romex12} | LF | $0.85 | $${(romex12 * 0.85).toLocaleString()} |
| 26 05 13 | 14/2 Romex wire | ${romex14} | LF | $0.65 | $${(romex14 * 0.65).toLocaleString()} |
| 26 24 13 | GFCI outlets | ${gfciCount} | EA | $25.00 | $${(gfciCount * 25).toLocaleString()} |
| 26 24 13 | Standard outlets | ${standardCount} | EA | $8.00 | $${(standardCount * 8).toLocaleString()} |
| 26 24 13 | Light fixtures | ${fixtures} | EA | $${tier === 'premium' ? '120' : tier === 'value' ? '80' : '60'}.00 | $${(fixtures * (tier === 'premium' ? 120 : tier === 'value' ? 80 : 60)).toLocaleString()} |
| 26 24 13 | ${panelAmps}A Panel & breakers | 1 | EA | $${panelAmps >= 400 ? '8000' : panelAmps >= 200 ? '2000' : '1200'}.00 | $${(panelAmps >= 400 ? 8000 : panelAmps >= 200 ? 2000 : 1200).toLocaleString()} |`);
        }
        
        if (allTrades.includes('framing')) {
          const lumberBF = Math.round(sqft * 2.5);
          csiLineItems.push(`### Division 06 - Framing
| CSI Code | Description | Quantity | Unit | Unit Cost | Extended |
|----------|-------------|----------|------|-----------|----------|
| 06 10 00 | Framing lumber (2x4, 2x6) | ${lumberBF} | BF | $${tier === 'premium' ? '1.20' : tier === 'value' ? '0.95' : '0.75'} | $${(lumberBF * (tier === 'premium' ? 1.20 : tier === 'value' ? 0.95 : 0.75)).toLocaleString()} |
| 06 10 00 | OSB Sheathing | ${Math.round(sqft * 1.1)} | SF | $${tier === 'premium' ? '1.10' : tier === 'value' ? '0.85' : '0.70'} | $${(Math.round(sqft * 1.1) * (tier === 'premium' ? 1.10 : tier === 'value' ? 0.85 : 0.70)).toLocaleString()} |
| 06 10 00 | Fasteners (nails, screws) | ${Math.round(sqft * 0.5)} | LB | $${tier === 'premium' ? '4.50' : tier === 'value' ? '3.75' : '3.00'} | $${(Math.round(sqft * 0.5) * (tier === 'premium' ? 4.50 : tier === 'value' ? 3.75 : 3.00)).toLocaleString()} |`);
        }
        
        if (allTrades.includes('concrete')) {
          const concreteYards = Math.round((sqft * 0.33) / 27); // 4" slab
          csiLineItems.push(`### Division 03 - Concrete
| CSI Code | Description | Quantity | Unit | Unit Cost | Extended |
|----------|-------------|----------|------|-----------|----------|
| 03 30 00 | Concrete (3000 PSI) | ${concreteYards} | CY | $${tier === 'premium' ? '180' : tier === 'value' ? '165' : '150'}.00 | $${(concreteYards * (tier === 'premium' ? 180 : tier === 'value' ? 165 : 150)).toLocaleString()} |
| 03 30 00 | Wire mesh reinforcement | ${sqft} | SF | $${tier === 'premium' ? '1.50' : tier === 'value' ? '1.25' : '1.00'} | $${(sqft * (tier === 'premium' ? 1.50 : tier === 'value' ? 1.25 : 1.00)).toLocaleString()} |
| 03 30 00 | Formwork & finishing | ${sqft} | SF | $${tier === 'premium' ? '2.50' : tier === 'value' ? '2.00' : '1.75'} | $${(sqft * (tier === 'premium' ? 2.50 : tier === 'value' ? 2.00 : 1.75)).toLocaleString()} |`);
        }
        
        // Generate material specifications
        const materialSpecs: string[] = [];
        if (hasElectrical) {
          materialSpecs.push(`**Electrical**: ${quality} grade materials - Panel: Square D QO ${panelAmps}A (or approved equal), Wire: 12 AWG Romex UL listed, Outlets: Leviton 15A (or approved equal)`);
        }
        if (allTrades.includes('framing')) {
          materialSpecs.push(`**Framing**: ${quality} grade - Lumber: #2 Grade SPF, Fasteners: Galvanized nails/screws, Sheathing: 7/16" OSB`);
        }
        if (allTrades.includes('roofing')) {
          materialSpecs.push(`**Roofing**: ${quality} grade - Shingles: ${tier === 'premium' ? 'Premium architectural' : tier === 'value' ? 'Standard architectural' : 'Basic 3-tab'}, Underlayment: Synthetic`);
        }
        if (allTrades.includes('concrete')) {
          materialSpecs.push(`**Concrete**: ${quality} grade - 3000 PSI mix, 4" thickness, Wire mesh reinforcement`);
        }
        
        const title = tier === 'budget' ? 'Option A: Budget Build' : tier === 'value' ? 'Option B: Best Value' : 'Option C: Premium';
        const description = tier === 'budget' ? 'Basic materials, minimum required labor, no extras' : 
                          tier === 'value' ? 'Standard materials, balanced durability, reasonable upgrades' : 
                          'High-end materials, extended warranty options, smart upgrades, full code modernization';
        
        // Build project summary - only show bedrooms/bathrooms if relevant
        let projectSummary = `## Project Summary
- **Location**: ${city}, ${province}
- **Project Type**: ${constructionType === 'new' ? 'New Build' : constructionType === 'renovation' ? 'Renovation' : constructionType === 'addition' ? 'Addition' : 'Repair'}
- **Project**: ${projectTypeLabel}
- **Province**: ${province} (Cost adjustment: ${costMultiplier > 1 ? '+' : ''}${Math.round((costMultiplier - 1) * 100)}% vs national average)`;
        
        if (!isGarage && bedrooms > 0 && bathrooms > 0) {
          projectSummary += `\n- **Bedrooms**: ${bedrooms}, **Bathrooms**: ${bathrooms}`;
        }
        
        // Professional Quote Header
        const quoteHeader = `# CONSTRUCTION ESTIMATE

## ${companyName}
${companyAddress}
Phone: ${companyPhone} | Email: ${companyEmail}
License: ${companyLicense}

---

**ESTIMATE FOR**: ${clientName || 'Customer Name'}
**Project**: ${details?.projectName || details?.projectDescription || projectTypeLabel}
**Project Address**: ${projectAddress || `${city}, ${province}`}

**Quote Number**: ${quoteNumber}
**Date Issued**: ${quoteDate}
**Valid Until**: ${expirationDateStr} (${quoteExpirationDays} days)
**Revision**: 1.0
**Prepared By**: ${estimatorName}

---

*This estimate is prepared for ${clientName} and is valid for ${quoteExpirationDays} days from the date of issue.*

---
`;
        
        return `${quoteHeader}# ${title}
## ${description}

${projectSummary}

## Cost Breakdown

### Trade Costs (Subtotal):
${tradeBreakdowns.map(tb => {
  const match = tb.match(/\$\d[\d,]+/);
  return match ? `- ${tb.split(':')[0].replace('### ', '')}: ${match[0]}` : '';
}).filter(Boolean).join('\n')}

**Trade Subtotal: $${tradeSubtotal.toLocaleString()}**
- Materials: $${totalMaterials.toLocaleString()} (${quality} grade, ${province} pricing)
- Labor: $${totalLabor.toLocaleString()} (${totalHours} hours)

### Additional Costs:
- **Permits**: $${permits.toLocaleString()} ${hasElectrical || hasPlumbing ? `(Building: $${Math.round(permits * 0.7).toLocaleString()}, ${hasElectrical ? `Electrical: $${hasElectrical && !hasPlumbing ? Math.round(permits * 0.3).toLocaleString() : Math.round(permits * 0.15).toLocaleString()}` : ''}${hasPlumbing ? `${hasElectrical ? ', ' : ''}Plumbing: $${Math.round(permits * 0.15).toLocaleString()}` : ''})` : ''}
- **Equipment**: $${equipment.toLocaleString()}
- **Waste Disposal**: $${waste.toLocaleString()}
- **Contingency** (${tier === 'budget' ? '5%' : tier === 'value' ? '8%' : '10%'}): $${contingency.toLocaleString()}

**Additional Costs Subtotal: $${additionalCosts.toLocaleString()}**

### Overhead & Profit:
- **Overhead** (${overheadPercent}%): $${overhead.toLocaleString()}
- **Profit** (${profitPercent}%): $${profit.toLocaleString()}

### **Total Project Cost: $${totalCost.toLocaleString()}**

**Cost Breakdown**:
- Direct Costs: $${directCosts.toLocaleString()}
  - Trade Subtotal: $${tradeSubtotal.toLocaleString()}
  - Additional Costs: $${additionalCosts.toLocaleString()}
- Overhead (${overheadPercent}%): $${overhead.toLocaleString()}
- Profit (${profitPercent}%): $${profit.toLocaleString()}
- **Total: $${totalCost.toLocaleString()}**

## Detailed Trade Breakdown

${tradeBreakdowns.join('\n\n')}

${csiLineItems.length > 0 ? `## CSI MasterFormat Line Items

${csiLineItems.join('\n\n')}

*Note: Line items shown are representative. Actual quantities may vary based on site conditions.*` : ''}

## Labor Breakdown
${laborBreakdown}
- **Total Hours**: ${totalHours} hours
- **Crew Size**: ${workers} workers
- **Experience Level**: ${experienceLevel}
- **Effective Rate**: $${effectiveLaborRate}/hr (${tier === 'budget' ? 'discounted' : tier === 'value' ? 'standard' : 'premium'} tier)

## Timeline
- **Total Duration**: ${timelineDays} working day${timelineDays === 1 ? '' : 's'} (${Math.ceil(timelineDays / 5)} week${Math.ceil(timelineDays / 5) === 1 ? '' : 's'})
${startDate ? `- **Start Date**: ${startDate}\n- **Completion Date**: ${endDate}` : '- **Start Date**: To be determined\n- **Completion Date**: To be determined'}
- **Critical Path**: ${allTrades.length > 3 ? 'Framing → Mechanicals → Drywall → Finishing' : tier === 'premium' ? 'Extended timeline for premium finishes and inspections' : 'Sequential trade completion'}
${tier === 'premium' ? '- **Note**: Premium tier includes additional time for high-quality finishes and detailed inspections' : ''}
${timelineDays <= 5 ? '- **Note**: For short-duration projects, payment schedule may be simplified (50% deposit, 50% completion)' : ''}

## Risk Flags
${riskFlags.length > 0 ? riskFlags.join('\n') : '- No major risks identified based on provided information'}

## Upsell Opportunities
${upsells.length > 0 ? upsells.join('\n') : '- No additional upsells recommended for this tier'}

## Money-Saving Options
${savings.length > 0 ? savings.join('\n') + `\n\n**Total Potential Savings: $${totalSavings.toLocaleString()}**` : '- No significant savings opportunities identified for this project size'}

## Payment Schedule

| Milestone | Description | % of Total | Amount | Due Date |
|-----------|-------------|------------|--------|----------|
${paymentMilestones.map(m => `| ${m.name} | ${m.description} | ${m.percent}% | $${m.amount.toLocaleString()} | ${m.due} |`).join('\n')}

**Total**: $${totalCost.toLocaleString()}

## Terms & Conditions

### Payment Terms
- **Deposit**: 25% upon acceptance of this estimate
- **Progress Payments**: 25% at framing, 25% at drywall, 25% at completion
- **Final Payment**: Due upon final inspection and acceptance
- **Payment Methods**: Check, bank transfer, or credit card (3% fee)

### Change Orders
- All changes must be approved in writing before work begins
- Additional costs will be calculated at current material and labor rates
- Timeline may be adjusted for change orders
- Change orders will be documented and signed by both parties

### Warranty
- **Workmanship**: 1-year warranty on all work performed
- **Materials**: Manufacturer warranties apply to all materials
- **Defects**: Any defects in workmanship will be corrected at no charge

### Validity
- This estimate is valid for ${quoteExpirationDays} days from date of issue
- Prices are subject to change after expiration date
- Material prices may fluctuate based on market conditions

### Acceptance
- This is an estimate, not a contract
- Final contract will be issued upon acceptance of this estimate
- Work will begin upon receipt of signed contract and deposit

### Liability
- Contractor carries $2M general liability insurance
- Workers' compensation insurance in place
- Client responsible for obtaining necessary permits (if applicable)

## Exclusions & Assumptions

### Exclusions (Not Included in This Estimate)
${exclusions.map(e => `- ${e}`).join('\n')}

### Assumptions
${assumptions.map(a => `- ${a}`).join('\n')}

## Material Specifications

${materialSpecs.length > 0 ? materialSpecs.join('\n\n') : 'Standard ${quality} grade materials as specified in trade breakdowns.'}

## Notes & Implementation Tips
- Schedule permits ${details?.whoPullsPermits === 'contractor' ? 'through contractor' : 'through homeowner'} 2-4 weeks before start
- Coordinate trades to minimize delays
- Order materials 2-3 weeks in advance for best pricing
- Use local ${city} suppliers for faster delivery
- ${province === 'BC' ? 'Check BC Hydro rebates for energy efficiency' : province === 'ON' ? 'Check IESO rebates for energy efficiency' : 'Check provincial energy efficiency rebates'}

---

**This estimate prepared by**: ${estimatorName}
**Date**: ${quoteDate}
**Quote Number**: ${quoteNumber}
**Valid Until**: ${expirationDateStr}`;
      };
      
      const budgetEstimate = generateEstimateOption('budget');
      const valueEstimate = generateEstimateOption('value');
      const premiumEstimate = generateEstimateOption('premium');
      
      // Building code section (shared across all options, shown once)
      const buildingCodeSection = `## ${province} Building Code Requirements (All Options)
- **Building Code**: National Building Code of Canada (NBC) with ${province} amendments
- **Permits Required**: Building permit${hasElectrical ? ', Electrical permit' : ''}${hasPlumbing ? ', Plumbing permit' : ''}
- **Inspections**: Rough-in, Final, Occupancy
- **Energy Code**: ${province === 'BC' ? 'BC Energy Step Code' : province === 'ON' ? 'Ontario Building Code Energy Requirements' : 'NBC Energy Efficiency Requirements'}
${province === 'BC' ? '- BC Energy Step Code compliance required\n- Higher efficiency standards than NBC\n- May qualify for BC Hydro rebates' :
province === 'ON' ? '- ESA (Electrical Safety Authority) inspection required\n- Must use licensed electrician\n- Tarion warranty may apply for new homes' :
province === 'QC' ? '- RBQ (Régie du bâtiment du Québec) permit required\n- Must use master electrician\n- French documentation may be required' :
province === 'AB' ? '- Safety Codes Council inspection required\n- Must use licensed electrician\n- Higher seismic requirements in some areas' :
province === 'NL' ? '- Service NL (Department of Municipal Affairs) building permits required\n- Must use licensed contractors (Electrical: Master Electrician, Plumbing: Licensed Plumber)\n- Check local municipal requirements (CBS, St. John\'s, Mount Pearl may have additional requirements)\n- NL Building Code based on National Building Code with provincial amendments\n- Energy efficiency requirements per NL Building Code\n- Permits typically processed within 10-15 business days\n- For CBS (Conception Bay South), contact Town of CBS Building Department' :
'- Follow National Building Code of Canada\n- Provincial amendments may apply\n- Check with local building department'}`;
      
      return NextResponse.json({
        success: true,
        estimateOptions: {
          budget: budgetEstimate,
          value: valueEstimate,
          premium: premiumEstimate,
          buildingCode: buildingCodeSection // Shared section
        },
        businessType,
        optimizationType
      });
    }

    const businessResponses = mockResponses[businessType as keyof typeof mockResponses];
    const defaultResponse = (businessResponses && optimizationType in businessResponses 
      ? (businessResponses as any)[optimizationType] 
      : null) || 
      "Analysis completed. Optimization recommendations generated based on your business data.";

    // Extract savings amount (mock calculation)
    const savingsMatch = defaultResponse.match(/\$[\d,]+/g);
    let estimatedSavings = 50000; // Default
    if (savingsMatch) {
      const amounts = savingsMatch.map((s: string) => parseInt(s.replace(/[$,]/g, '')));
      estimatedSavings = Math.max(...amounts);
    }

    return NextResponse.json({
      success: true,
      result: defaultResponse,
      estimatedSavings,
      businessType,
      optimizationType
    });

  } catch (error) {
    console.error('AI optimization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate optimization analysis' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai',
    description: 'AI-powered business optimization API',
    status: 'active'
  });
}
