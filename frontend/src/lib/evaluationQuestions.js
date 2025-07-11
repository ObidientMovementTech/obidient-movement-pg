const evaluationQuestions = {
  capacity: {
    title: "Capacity Assessment",
    maxScore: 30,
    sections: [
      {
        subgroup: "Vision and Strategic Thinking",
        weight: 3,
        questions: [
          {
            text: "How has the candidate defined their long-term vision for governance?",
            options: [
              { label: "No clear vision", value: 0 },
              { label: "General idea but lacks details", value: 2 },
              { label: "Somewhat defined but not actionable", value: 4 },
              { label: "Well-defined with a strategic approach", value: 6 },
              { label: "Fully developed vision with a clear roadmap and execution plan", value: 8 },
              { label: "Transformational vision with measurable goals and national impact", value: 10 }
            ]
          },
          {
            text: "How often does the candidate align policies with national development goals and citizens' needs?",
            options: [
              { label: "Rarely or never", value: 0 },
              { label: "Occasionally, without a clear strategy", value: 2 },
              { label: "Sometimes, but inconsistently", value: 4 },
              { label: "Frequently, with specific policies in place", value: 6 },
              { label: "Always, with measurable impact on national development", value: 8 },
              { label: "Integrated alignment with clear evidence of long-term success", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Decision-Making Under Pressure",
        weight: 3,
        questions: [
          {
            text: "How effectively does the candidate handle governance crises and high-pressure situations?",
            options: [
              { label: "Avoids making decisions", value: 0 },
              { label: "Reacts emotionally or irrationally", value: 2 },
              { label: "Delays decisions but eventually acts", value: 4 },
              { label: "Takes calculated, well-informed decisions", value: 6 },
              { label: "Swift, decisive action with strong results", value: 8 },
              { label: "Crisis management strategies have been widely recognised as successful", value: 10 }
            ]
          },
          {
            text: "Has the candidate ever reversed a major policy decision based on new evidence or changing circumstances?",
            options: [
              { label: "Never", value: 0 },
              { label: "Rarely and often under pressure", value: 2 },
              { label: "Occasionally, with limited adaptation", value: 4 },
              { label: "Regularly, based on expert consultation", value: 6 },
              { label: "Proactively adjusts policies to ensure long-term effectiveness", value: 8 },
              { label: "Demonstrated exceptional adaptability in governance", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Resource Mobilisation & Economic Management",
        weight: 3,
        questions: [
          {
            text: "How effectively has the candidate mobilised financial, human, and material resources for public projects?",
            options: [
              { label: "No history of resource mobilisation", value: 0 },
              { label: "Minimal impact, dependent on external support", value: 2 },
              { label: "Moderate ability, but challenges exist", value: 4 },
              { label: "Effective mobilisation with good results", value: 6 },
              { label: "Demonstrated excellence in resource mobilisation", value: 8 },
              { label: "Successfully implemented multi-sectoral resource generation initiatives", value: 10 }
            ]
          },
          {
            text: "How does the candidate ensure economic management and fiscal discipline?",
            options: [
              { label: "No clear financial management strategy", value: 0 },
              { label: "Frequent budget mismanagement", value: 2 },
              { label: "Some financial prudence but inconsistent", value: 4 },
              { label: "Ensures responsible allocation of resources", value: 6 },
              { label: "Implements effective cost-saving measures and maximises resources", value: 8 },
              { label: "Recognised for economic efficiency and fiscal discipline", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Resilience & Crisis Management",
        weight: 3,
        questions: [
          {
            text: "How effectively does the candidate respond to and recover from governance crises?",
            options: [
              { label: "No resilience demonstrated", value: 0 },
              { label: "Reactive without clear plans", value: 2 },
              { label: "Some preparedness but lacks execution", value: 4 },
              { label: "Effective crisis management with structured responses", value: 6 },
              { label: "Successfully handled multiple crises with significant impact", value: 8 },
              { label: "Implemented long-term crisis management frameworks", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Political Will & Execution Ability",
        weight: 3,
        questions: [
          {
            text: "Has the candidate successfully implemented controversial reforms despite opposition?",
            options: [
              { label: "Never taken a firm stance", value: 0 },
              { label: "Backed down under political pressure", value: 2 },
              { label: "Attempted reform but lacked execution", value: 4 },
              { label: "Completed reforms with moderate impact", value: 6 },
              { label: "Strong track record of executing policies despite opposition", value: 8 },
              { label: "Proven commitment to driving institutional change", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Cause-Building & Stakeholder Management",
        weight: 3,
        questions: [
          {
            text: "How effectively does the candidate engage with political parties, civil society, and community leaders?",
            options: [
              { label: "No engagement", value: 0 },
              { label: "Limited interactions, no lasting partnerships", value: 2 },
              { label: "Moderate cause-building efforts", value: 4 },
              { label: "Strong alliances that facilitate governance", value: 6 },
              { label: "Effective at uniting diverse stakeholders", value: 8 },
              { label: "Proven ability to build national consensus", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Institutional Strengthening & Good Governance",
        weight: 3,
        questions: [
          {
            text: "Has the candidate implemented reforms to strengthen democratic institutions and governance structures?",
            options: [
              { label: "No institutional reforms", value: 0 },
              { label: "Minimal reforms with no lasting impact", value: 2 },
              { label: "Some reform efforts are inconsistent", value: 4 },
              { label: "Moderate institutional reforms with clear improvements", value: 6 },
              { label: "Strengthened key governance institutions", value: 8 },
              { label: "Led major governance reforms with national impact", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Accountability & Transparency in Governance",
        weight: 3,
        questions: [
          {
            text: "Does the candidate ensure transparent governance and public accountability?",
            options: [
              { label: "No transparency", value: 0 },
              { label: "Limited disclosures, hides key information", value: 2 },
              { label: "Some transparency but inconsistent", value: 4 },
              { label: "Regular public disclosures", value: 6 },
              { label: "Fully transparent and accountable in governance", value: 8 },
              { label: "Recognised for setting high standards of transparency", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Implementation Efficiency & Results Delivery",
        weight: 3,
        questions: [
          {
            text: "How effectively does the candidate execute policies, projects, and initiatives?",
            options: [
              { label: "No record of policy execution", value: 0 },
              { label: "Policies implemented with minimal success", value: 2 },
              { label: "Some successful policies but inconsistencies", value: 4 },
              { label: "Regularly delivers on key projects", value: 6 },
              { label: "A well-documented history of policy execution", value: 8 },
              { label: "Recognised for exceptional efficiency and delivery", value: 10 }
            ]
          }
        ]
      }
    ]
  },
  competence: {
    title: "Competence Assessment",
    maxScore: 30,
    sections: [
      {
        subgroup: "Educational and Professional Background",
        weight: 3,
        questions: [
          {
            text: "What is the highest level of education attained by the candidate?",
            options: [
              { label: "No formal education", value: 0 },
              { label: "Secondary education", value: 2 },
              { label: "Bachelor's degree", value: 4 },
              { label: "Master’s degree", value: 6 },
              { label: "Doctorate or equivalent in governance-related field", value: 8 },
              { label: "Advanced certification with extensive professional experience", value: 10 }
            ]
          },
          {
            text: "Has the candidate undergone specialised leadership or governance training?",
            options: [
              { label: "No training or exposure", value: 0 },
              { label: "Minimal informal training", value: 2 },
              { label: "Completed one structured leadership programme", value: 4 },
              { label: "Multiple training programmes with applied knowledge", value: 6 },
              { label: "Internationally recognised leadership certification", value: 8 },
              { label: "Advanced executive leadership training with real-world impact", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Policy Impact & Legislative Effectiveness",
        weight: 3,
        questions: [
          {
            text: "Has the candidate introduced or supported policies that had a measurable impact on governance?",
            options: [
              { label: "No policies introduced", value: 0 },
              { label: "Proposed policies but not enacted", value: 2 },
              { label: "Enacted policies with limited impact", value: 4 },
              { label: "Implemented policies with visible changes", value: 6 },
              { label: "Introduced major reforms that significantly improved governance", value: 8 },
              { label: "Authored transformative policies with long-term national impact", value: 10 }
            ]
          },
          {
            text: "How does the candidate measure the success of policies implemented?",
            options: [
              { label: "No clear measurement", value: 0 },
              { label: "Basic tracking but lacks effectiveness", value: 2 },
              { label: "Limited impact evaluation", value: 4 },
              { label: "Uses structured performance indicators", value: 6 },
              { label: "Conducts regular assessments with measurable success", value: 8 },
              { label: "Recognised for outstanding policy effectiveness", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Innovative Thinking & Problem-Solving Ability",
        weight: 3,
        questions: [
          {
            text: "How frequently does the candidate introduce new and creative solutions to governance challenges?",
            options: [
              { label: "Never", value: 0 },
              { label: "Rarely, with minimal results", value: 2 },
              { label: "Occasionally, but with limited effectiveness", value: 4 },
              { label: "Regularly, with noticeable improvements", value: 6 },
              { label: "Consistently, with significant and sustainable impact", value: 8 },
              { label: "Recognised for innovative policy reforms and governance solutions", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Communication & Public Engagement",
        weight: 3,
        questions: [
          {
            text: "How effectively does the candidate communicate complex policies to the public and stakeholders?",
            options: [
              { label: "Poor communicator with no public engagement", value: 0 },
              { label: "Communicates but lacks clarity", value: 2 },
              { label: "Moderate communicator with limited outreach", value: 4 },
              { label: "Engages citizens effectively through media", value: 6 },
              { label: "Excellent public speaker and policy communicator", value: 8 },
              { label: "Transformational communicator with strong engagement strategies", value: 10 }
            ]
          },
          {
            text: "Has the candidate participated in public debates, town halls, or national discussions?",
            options: [
              { label: "Never", value: 0 },
              { label: "Rarely, without major impact", value: 2 },
              { label: "Occasionally, but with limited engagement", value: 4 },
              { label: "Regularly, with strong public interactions", value: 6 },
              { label: "Widely recognised for effective public engagement", value: 8 },
              { label: "Nationally influential in public discourse", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Execution Capability & Project Management",
        weight: 3,
        questions: [
          {
            text: "How effectively does the candidate execute policies, projects, and initiatives?",
            options: [
              { label: "No record of policy execution", value: 0 },
              { label: "Policies implemented with minimal success", value: 2 },
              { label: "Some successful policies but inconsistencies", value: 4 },
              { label: "Regularly delivers on key projects", value: 6 },
              { label: "Well-documented history of policy execution", value: 8 },
              { label: "Recognised for exceptional efficiency and delivery", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Crisis Management & Decision-Making Under Pressure",
        weight: 3,
        questions: [
          {
            text: "How effectively does the candidate respond to and manage governance crises?",
            options: [
              { label: "Avoids crises", value: 0 },
              { label: "Responds poorly under pressure", value: 2 },
              { label: "Attempts solutions but lacks effectiveness", value: 4 },
              { label: "Provides structured responses", value: 6 },
              { label: "Successfully handles crises with significant impact", value: 8 },
              { label: "Implemented long-term crisis management frameworks", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Stakeholder Management & Diplomacy",
        weight: 3,
        questions: [
          {
            text: "How well does the candidate engage with political parties, civil society, and international partners?",
            options: [
              { label: "No engagement", value: 0 },
              { label: "Limited interactions, no lasting partnerships", value: 2 },
              { label: "Moderate cause-building efforts", value: 4 },
              { label: "Strong alliances that facilitate governance", value: 6 },
              { label: "Effective at uniting diverse stakeholders", value: 8 },
              { label: "Proven ability to build national consensus", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Adaptability & Global Awareness",
        weight: 3,
        questions: [
          {
            text: "How effectively does the candidate adapt to global and national political, economic, and security changes?",
            options: [
              { label: "No adaptability", value: 0 },
              { label: "Struggles with change", value: 2 },
              { label: "Some adaptability but inconsistent", value: 4 },
              { label: "Adjusts policies effectively", value: 6 },
              { label: "Demonstrates proactive and strategic adaptation", value: 8 },
              { label: "Recognised for global awareness and adaptability", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Analytical Skills & Evidence-Based Decision-Making",
        weight: 3,
        questions: [
          {
            text: "How does the candidate incorporate data and research in decision-making?",
            options: [
              { label: "No reliance on data", value: 0 },
              { label: "Makes decisions based on intuition or political pressure", value: 2 },
              { label: "Uses basic data but does not prioritise evidence-based policy", value: 4 },
              { label: "Regularly integrates research into policy decisions", value: 6 },
              { label: "Uses comprehensive data and analysis for governance strategies", value: 8 },
              { label: "Recognised for excellence in data-driven governance", value: 10 }
            ]
          }
        ]
      }
    ]
  },
  character: {
    title: "Character Assessment",
    maxScore: 40,
    sections: [
      {
        subgroup: "Ethical Behaviour & Integrity",
        weight: 6,
        questions: [
          {
            text: "Has the candidate ever been involved in corruption or unethical practices?",
            options: [
              { label: "Multiple corruption scandals", value: 0 },
              { label: "Some allegations without resolution", value: 2 },
              { label: "No direct involvement but tolerated unethical behaviour", value: 4 },
              { label: "Strong ethical reputation with no known scandals", value: 6 },
              { label: "Recognised for anti-corruption efforts", value: 8 },
              { label: "Proactively fought corruption with documented success", value: 10 }
            ]
          },
          {
            text: "Does the candidate demonstrate ethical leadership in decision-making?",
            options: [
              { label: "No ethical standards in governance", value: 0 },
              { label: "Decisions often favour personal or political interests", value: 2 },
              { label: "Occasionally demonstrates ethical considerations", value: 4 },
              { label: "Regularly applies ethical decision-making principles", value: 6 },
              { label: "A strong advocate for ethical governance", value: 8 },
              { label: "Nationally recognised as a leader in ethical leadership", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Transparency & Openness",
        weight: 6,
        questions: [
          {
            text: "Does the candidate ensure transparent governance and public accountability?",
            options: [
              { label: "No transparency", value: 0 },
              { label: "Limited disclosures, hide key information", value: 2 },
              { label: "Some transparency but inconsistent", value: 4 },
              { label: "Regular public disclosures", value: 6 },
              { label: "Fully transparent and accountable in governance", value: 8 },
              { label: "Recognised for setting high standards of transparency", value: 10 }
            ]
          },
          {
            text: "Does the candidate publish financial records and governance reports or openly dialogue with the public?",
            options: [
              { label: "Never", value: 0 },
              { label: "Only when required by law", value: 2 },
              { label: "Occasionally, with selective disclosures", value: 4 },
              { label: "Regular financial and governance disclosures", value: 6 },
              { label: "Actively engages in open governance initiatives", value: 8 },
              { label: "Recognised for exceptional public transparency", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Accountability & Willingness to Take Responsibility",
        weight: 6,
        questions: [
          {
            text: "How does the candidate respond to governance failures, mistakes, or crises?",
            options: [
              { label: "Avoids responsibility and blames others", value: 0 },
              { label: "Rarely acknowledges failures", value: 2 },
              { label: "Occasionally accepts responsibility but lacks corrective action", value: 4 },
              { label: "Acknowledges mistakes and actively corrects them", value: 6 },
              { label: "Consistently takes responsibility and enforces accountability", value: 8 },
              { label: "Recognised for fostering a culture of accountability in governance", value: 10 }
            ]
          },
          {
            text: "How effectively does the candidate ensure public officials and institutions under their leadership are accountable?",
            options: [
              { label: "No accountability measures", value: 0 },
              { label: "Weak enforcement of accountability", value: 2 },
              { label: "Some efforts to ensure accountability", value: 4 },
              { label: "Implements structured accountability measures", value: 6 },
              { label: "Strong institutional frameworks for accountability", value: 8 },
              { label: "A national leader in promoting governance accountability", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Empathy & Emotional Intelligence",
        weight: 6,
        questions: [
          {
            text: "How well does the candidate understand and respond to the needs and struggles of the citizens?",
            options: [
              { label: "No concern for citizen welfare", value: 0 },
              { label: "Occasionally acknowledges citizens’ concerns", value: 2 },
              { label: "Some efforts to engage with citizens but lack consistency", value: 4 },
              { label: "Regularly listens and responds to citizens’ concerns", value: 6 },
              { label: "Prioritises citizen engagement and policies that address their needs", value: 8 },
              { label: "Exceptional public servant, deeply engaged with citizens", value: 10 }
            ]
          },
          {
            text: "Has the candidate taken concrete actions to support vulnerable and marginalised groups?",
            options: [
              { label: "No efforts made", value: 0 },
              { label: "Some statements but no concrete action", value: 2 },
              { label: "Limited policies addressing marginalised groups", value: 4 },
              { label: "Implemented effective policies for inclusion", value: 6 },
              { label: "Significant impact on marginalised communities", value: 8 },
              { label: "Nationally recognised for advancing social justice and inclusion", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Justice, Fairness & Respect for the Rule of Law",
        weight: 6,
        questions: [
          {
            text: "Has the candidate ever influenced the judiciary for personal or political gain?",
            options: [
              { label: "Actively interfered with judicial processes", value: 0 },
              { label: "Some history of judicial interference", value: 2 },
              { label: "No direct interference but weak stance on judicial independence", value: 4 },
              { label: "Supports judicial independence", value: 6 },
              { label: "A strong advocate for fairness and the rule of law", value: 8 },
              { label: "Has taken significant steps to strengthen judicial integrity", value: 10 }
            ]
          },
          {
            text: "How does the candidate ensure laws and policies are applied fairly to all citizens?",
            options: [
              { label: "Enforces laws selectively for political interests", value: 0 },
              { label: "Weak commitment to legal fairness", value: 2 },
              { label: "Some commitment to fairness but with inconsistencies", value: 4 },
              { label: "Generally fair application of laws", value: 6 },
              { label: "A strong advocate for fairness and anti-discrimination", value: 8 },
              { label: "Implemented landmark reforms ensuring fairness and justice", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Moral Courage & Consistency",
        weight: 5,
        questions: [
          {
            text: "Has the candidate demonstrated courage to stand against corruption, injustice, or political pressure?",
            options: [
              { label: "No history of standing against corruption", value: 0 },
              { label: "Rarely takes a strong stance", value: 2 },
              { label: "Occasionally speaks against corruption but lacks action", value: 4 },
              { label: "Regularly takes firm action against corruption", value: 6 },
              { label: "Nationally recognised for fighting corruption and injustice", value: 8 },
              { label: "Has led transformative anti-corruption reforms", value: 10 }
            ]
          }
        ]
      },
      {
        subgroup: "Patriotism & National Interest Above Personal Gain",
        weight: 5,
        questions: [
          {
            text: "How does the candidate prioritise national interest over personal or political gain?",
            options: [
              { label: "Frequently prioritises personal interests over national concerns", value: 0 },
              { label: "Some national focus but prioritises party/personal gain", value: 2 },
              { label: "Balances political interests and national service", value: 4 },
              { label: "Primarily focused on national development", value: 6 },
              { label: "Firmly committed to national service over personal gain", value: 8 },
              { label: "Known for selfless leadership and national sacrifice", value: 10 }
            ]
          }
        ]
      }
    ]
  }
};

export default evaluationQuestions;