import { scoreTest } from "@/lib/scoring";

describe("scoreTest", () => {
  const passingIndicators = new Map<string, number>([
    ["comp_1", 50],
    ["comp_2", 75],
  ]);

  it("should score SINGLE_CHOICE correctly", () => {
    const questions = [
      { id: 1, questionType: "SINGLE_CHOICE" as const, correctAnswers: ["B"], competenceId: "comp_1" },
    ];
    const answers = [{ questionId: 1, answer: "B" }];

    const result = scoreTest(questions, answers, passingIndicators);

    expect(result.answers[0].correct).toBe(true);
    expect(result.overallPercentage).toBe(100);
    expect(result.overallPassed).toBe(true);
  });

  it("should mark wrong SINGLE_CHOICE as incorrect", () => {
    const questions = [
      { id: 1, questionType: "SINGLE_CHOICE" as const, correctAnswers: ["B"], competenceId: "comp_1" },
    ];
    const answers = [{ questionId: 1, answer: "A" }];

    const result = scoreTest(questions, answers, passingIndicators);

    expect(result.answers[0].correct).toBe(false);
    expect(result.overallPercentage).toBe(0);
  });

  it("should score MULTIPLE_CHOICE all-or-nothing", () => {
    const questions = [
      { id: 1, questionType: "MULTIPLE_CHOICE" as const, correctAnswers: ["A", "C"], competenceId: "comp_1" },
    ];

    // Correct
    expect(
      scoreTest(questions, [{ questionId: 1, answer: ["A", "C"] }], passingIndicators).answers[0].correct
    ).toBe(true);

    // Partial — should be wrong (all-or-nothing)
    expect(
      scoreTest(questions, [{ questionId: 1, answer: ["A"] }], passingIndicators).answers[0].correct
    ).toBe(false);

    // Extra answer — wrong
    expect(
      scoreTest(questions, [{ questionId: 1, answer: ["A", "B", "C"] }], passingIndicators).answers[0].correct
    ).toBe(false);
  });

  it("should score ORDERING as exact sequence match", () => {
    const questions = [
      { id: 1, questionType: "ORDERING" as const, correctAnswers: [0, 1, 2], competenceId: "comp_1" },
    ];

    expect(
      scoreTest(questions, [{ questionId: 1, answer: [0, 1, 2] }], passingIndicators).answers[0].correct
    ).toBe(true);

    expect(
      scoreTest(questions, [{ questionId: 1, answer: [2, 1, 0] }], passingIndicators).answers[0].correct
    ).toBe(false);
  });

  it("should score IMAGE_PLACEMENT as exact match", () => {
    const questions = [
      { id: 1, questionType: "IMAGE_PLACEMENT" as const, correctAnswers: ["X", "Y", "Z"], competenceId: "comp_1" },
    ];

    expect(
      scoreTest(questions, [{ questionId: 1, answer: ["X", "Y", "Z"] }], passingIndicators).answers[0].correct
    ).toBe(true);

    expect(
      scoreTest(questions, [{ questionId: 1, answer: ["Z", "Y", "X"] }], passingIndicators).answers[0].correct
    ).toBe(false);
  });

  it("should handle null/missing answers as incorrect", () => {
    const questions = [
      { id: 1, questionType: "SINGLE_CHOICE" as const, correctAnswers: ["B"], competenceId: "comp_1" },
      { id: 2, questionType: "SINGLE_CHOICE" as const, correctAnswers: ["A"], competenceId: "comp_1" },
    ];
    // Only answer question 1, skip question 2
    const answers = [{ questionId: 1, answer: "B" }];

    const result = scoreTest(questions, answers, passingIndicators);

    expect(result.answers[0].correct).toBe(true);
    expect(result.answers[1].correct).toBe(false);
    expect(result.overallPercentage).toBe(50);
  });

  it("should calculate per-competence scores", () => {
    const questions = [
      { id: 1, questionType: "SINGLE_CHOICE" as const, correctAnswers: ["A"], competenceId: "comp_1" },
      { id: 2, questionType: "SINGLE_CHOICE" as const, correctAnswers: ["B"], competenceId: "comp_1" },
      { id: 3, questionType: "SINGLE_CHOICE" as const, correctAnswers: ["C"], competenceId: "comp_2" },
      { id: 4, questionType: "SINGLE_CHOICE" as const, correctAnswers: ["D"], competenceId: "comp_2" },
    ];

    const answers = [
      { questionId: 1, answer: "A" }, // correct
      { questionId: 2, answer: "X" }, // wrong
      { questionId: 3, answer: "C" }, // correct
      { questionId: 4, answer: "X" }, // wrong
    ];

    const result = scoreTest(questions, answers, passingIndicators);

    // comp_1: 1/2 = 50%, passing is 50% → passed
    const comp1 = result.competenceScores.find((c) => c.competenceId === "comp_1")!;
    expect(comp1.percentage).toBe(50);
    expect(comp1.passed).toBe(true);

    // comp_2: 1/2 = 50%, passing is 75% → failed
    const comp2 = result.competenceScores.find((c) => c.competenceId === "comp_2")!;
    expect(comp2.percentage).toBe(50);
    expect(comp2.passed).toBe(false);

    expect(result.overallPassed).toBe(false);
    expect(result.failedCompetenceIds).toEqual(["comp_2"]);
  });

  it("should use 100% as default passing indicator", () => {
    const questions = [
      { id: 1, questionType: "SINGLE_CHOICE" as const, correctAnswers: ["A"], competenceId: "comp_new" },
    ];
    const answers = [{ questionId: 1, answer: "A" }];

    // comp_new not in the passingIndicators map → defaults to 100
    const result = scoreTest(questions, answers, passingIndicators);
    const score = result.competenceScores[0];
    expect(score.passed).toBe(true); // 100% >= 100%
  });

  it("should return 0% overall when no questions", () => {
    const result = scoreTest([], [], passingIndicators);
    expect(result.overallPercentage).toBe(0);
    expect(result.overallPassed).toBe(true);
    expect(result.answers).toHaveLength(0);
  });

  it("should handle all questions correct across multiple competences", () => {
    const questions = [
      { id: 1, questionType: "SINGLE_CHOICE" as const, correctAnswers: ["A"], competenceId: "comp_1" },
      { id: 2, questionType: "SINGLE_CHOICE" as const, correctAnswers: ["B"], competenceId: "comp_2" },
    ];
    const answers = [
      { questionId: 1, answer: "A" },
      { questionId: 2, answer: "B" },
    ];

    const result = scoreTest(questions, answers, passingIndicators);
    expect(result.overallPercentage).toBe(100);
    expect(result.overallPassed).toBe(true);
    expect(result.failedCompetenceIds).toHaveLength(0);
  });
});
