
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type Exercise = {
  first: number;
  second: number;
};

type ExerciseResult = {
  number: number;
  correct: boolean;
  skipped: boolean;
  points: number;
  seconds: number;
  example: string;
};

function getTime(): number {
  return performance.now();
}

function generateExercise(): Exercise {
  return {
    first: Math.floor(Math.random() * 90) + 10,
    second: Math.floor(Math.random() * 90) + 10,
  };
}

function getPoints(seconds: number): number {
  if (seconds < 30) return 10;
  if (seconds <= 45) return 9;
  if (seconds <= 60) return 8;
  return 7;
}

export default function Home() {
  const [exercise, setExercise] = useState<Exercise>({
    first: 38,
    second: 27,
  });

  const [answer, setAnswer] = useState(["", "", ""]);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"exercise" | "instruction">("exercise");
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  const questionStartedAt = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const activeInputIndex = useRef(2);

  useEffect(() => {
    if (!started || checked || finished) return;

    const timer = window.setInterval(() => {
      if (questionStartedAt.current !== null) {
        setElapsedSeconds(
          Math.floor((getTime() - questionStartedAt.current) / 1000),
        );
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, checked, finished]);

  function focusInput(index: number) {
    const safeIndex = Math.max(0, Math.min(2, index));
    activeInputIndex.current = safeIndex;
    inputRefs.current[safeIndex]?.focus();
  }

  function startExercises() {
    setExercise(generateExercise());
    setAnswer(["", "", ""]);
    setScore(0);
    setCompleted(0);
    setChecked(false);
    setMessage("");
    setFinished(false);
    setResults([]);
    setElapsedSeconds(0);

    questionStartedAt.current = getTime();

    setStarted(true);
    setTab("exercise");

    window.setTimeout(() => focusInput(2), 50);
  }

  function updateDigit(index: number, rawValue: string) {
    if (checked || finished || !started) return;

    const value = rawValue.replace(/\D/g, "").slice(-1);

    setAnswer((previous) => {
      const updated = [...previous];
      updated[index] = value;
      return updated;
    });

    setMessage("");

    if (value !== "" && index > 0) {
      window.setTimeout(() => focusInput(index - 1), 0);
    }
  }

  function enterDigit(digit: string) {
    if (checked || finished || !started) return;

    updateDigit(activeInputIndex.current, digit);
  }

  function deleteDigit() {
    if (checked || finished || !started) return;

    const index = activeInputIndex.current;

    if (answer[index] !== "") {
      setAnswer((previous) => {
        const updated = [...previous];
        updated[index] = "";
        return updated;
      });
    } else if (index < 2) {
      focusInput(index + 1);
      setAnswer((previous) => {
        const updated = [...previous];
        updated[index + 1] = "";
        return updated;
      });
    }

    setMessage("");
  }

  function moveInput(direction: "left" | "right") {
    if (checked || finished || !started) return;

    const index = activeInputIndex.current;

    if (direction === "left" && index > 0) {
      focusInput(index - 1);
    }

    if (direction === "right" && index < 2) {
      focusInput(index + 1);
    }
  }

  function finishExercise(
    isCorrect: boolean,
    isSkipped: boolean,
    seconds: number,
  ) {
    const correctAnswer = exercise.first + exercise.second;
    const points = isCorrect ? getPoints(seconds) : 0;
    const nextCompleted = completed + 1;

    setChecked(true);
    setCompleted(nextCompleted);
    setElapsedSeconds(seconds);

    setResults((previous) => [
      ...previous,
      {
        number: nextCompleted,
        correct: isCorrect,
        skipped: isSkipped,
        points,
        seconds,
        example: `${exercise.first} + ${exercise.second} = ${correctAnswer}`,
      },
    ]);

    if (isCorrect) {
      setScore((value) => value + points);
      setMessage(`Правильно! Ви отримали ${points} балів. Час: ${seconds} с.`);
    } else if (isSkipped) {
      setMessage("Приклад пропущено.");
    } else {
      setMessage(`Неправильно. Правильна відповідь: ${correctAnswer}.`);
    }

    if (nextCompleted >= 5) {
      setFinished(true);
      setStarted(false);
    }
  }

  function checkAnswer() {
    if (checked || finished || !started) return;

    const correctAnswer = exercise.first + exercise.second;
    const expectedDigits = String(correctAnswer).padStart(3, " ").split("");

    const isComplete = answer.every((digit, index) =>
      expectedDigits[index] === " " ? digit === "" : digit !== "",
    );

    if (!isComplete) {
      setMessage("Заповніть усі необхідні клітинки відповіді.");
      return;
    }

    const seconds =
      questionStartedAt.current === null
        ? 0
        : Math.floor((getTime() - questionStartedAt.current) / 1000);

    const isCorrect = answer.every(
      (digit, index) => digit === expectedDigits[index].trim(),
    );

    finishExercise(isCorrect, false, seconds);
  }

  function skipExercise() {
    if (!started || checked || finished) return;

    const seconds =
      questionStartedAt.current === null
        ? 0
        : Math.floor((getTime() - questionStartedAt.current) / 1000);

    finishExercise(false, true, seconds);
  }

  function nextExercise() {
    if (!checked) return;

    if (finished || completed >= 5) {
      setFinished(true);
      setStarted(false);
      return;
    }

    setExercise(generateExercise());
    setAnswer(["", "", ""]);
    setMessage("");
    setChecked(false);
    setElapsedSeconds(0);

    questionStartedAt.current = getTime();

    window.setTimeout(() => focusInput(2), 50);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Backspace") {
      event.preventDefault();

      if (answer[index] !== "") {
        setAnswer((previous) => {
          const updated = [...previous];
          updated[index] = "";
          return updated;
        });
      } else if (index < 2) {
        focusInput(index + 1);
      }

      setMessage("");
      return;
    }

    if (event.key === "ArrowRight" && index < 2) {
      focusInput(index + 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === "Enter") {
      if (checked) {
        nextExercise();
      } else {
        checkAnswer();
      }
    }
  }

  const timerColor =
    elapsedSeconds < 30
      ? "#16803c"
      : elapsedSeconds <= 45
        ? "#c49a00"
        : elapsedSeconds <= 60
          ? "#e87520"
          : "#d62828";

  const correctCount = results.filter((item) => item.correct).length;
  const skippedCount = results.filter((item) => item.skipped).length;
  const incorrectCount = results.filter(
    (item) => !item.correct && !item.skipped,
  ).length;
  const progress = Math.min((completed / 5) * 100, 100);

  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>∑</span>
            <span>
              <strong>Математика онлайн</strong>
              <small>Вивчай математику легко!</small>
            </span>
          </Link>

          <nav className={styles.navigation}>
            <a href="#exercises">Вправи</a>
            <a href="#about">Калькулятори</a>
            <a href="#about">Довідник</a>
            <a href="#about">Таблиці і формули</a>
          </nav>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.breadcrumb}>
          Головна / Математика / Вправи / Арифметика
        </div>

        <h1>Вправи. Додавання в стовпчик двозначних чисел</h1>

        <p className={styles.description}>
          Ці вправи дозволять перевірити, як ви вмієте складати в стовпчик
          двозначні числа.
        </p>

        <p className={styles.description}>
          Розв&apos;язання задач і вправ — найкращий спосіб перевірити свої
          знання і закріпити вивчений матеріал!
        </p>

        <section id="exercises" className={styles.exerciseSection}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={tab === "exercise" ? styles.activeTab : ""}
              onClick={() => setTab("exercise")}
            >
              Вправи
            </button>

            <button
              type="button"
              className={tab === "instruction" ? styles.activeTab : ""}
              onClick={() => setTab("instruction")}
            >
              Інструкція
            </button>
          </div>

          {tab === "instruction" ? (
            <div className={styles.instruction}>
              <h2>Інструкція до вправ</h2>
              <ol>
                <li>Завдання складається із 5 прикладів.</li>
                <li>Натисніть кнопку початку виконання завдань.</li>
                <li>
                  Введіть відповідь справа наліво: одиниці, десятки, сотні.
                  Курсор автоматично переходить до наступної клітинки.
                </li>
                <li>
                  Для введення цифр можна використовувати клавіатуру на екрані
                  або клавіатуру комп&apos;ютера.
                </li>
                <li>
                  Для видалення цифри використовуйте Backspace. Стрілки
                  дозволяють переміщуватися між клітинками.
                </li>
                <li>
                  Бали за правильну відповідь:
                  <ul>
                    <li>менше 30 секунд — 10 балів;</li>
                    <li>від 30 до 45 секунд — 9 балів;</li>
                    <li>від 46 до 60 секунд — 8 балів;</li>
                    <li>більше 60 секунд — 7 балів.</li>
                  </ul>
                </li>
                <li>
                  Після виконання 5 завдань з&apos;явиться підсумковий
                  результат.
                </li>
              </ol>
            </div>
          ) : (
            <div className={styles.exerciseContent}>
              <h2 className={styles.exerciseTitle}>
                Вправа. Знайдіть значення суми двох чисел:
              </h2>

              {finished ? (
                <div className={styles.finished}>
                  <h2>Вправи завершено!</h2>
                  <p>
                    Ваш результат: <strong>{score} з 50 балів.</strong>
                  </p>
                  <p>Правильно виконано: {correctCount} з 5 завдань.</p>
                  <p>Неправильних відповідей: {incorrectCount}.</p>
                  <p>Пропущено: {skippedCount}.</p>

                  <div className={styles.statistics}>
                    {results.map((item) => (
                      <div key={item.number}>
                        Завдання {item.number}:{" "}
                        {item.skipped
                          ? "Пропущено"
                          : item.correct
                            ? "Правильно"
                            : "Неправильно"}{" "}
                        — {item.points} балів, {item.seconds} с
                        <span> ({item.example})</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={startExercises}
                    className={styles.primaryButton}
                  >
                    Спробувати знову
                  </button>
                </div>
              ) : !started ? (
                <div className={styles.startPanel}>
                  <p>
                    Вам потрібно розв&apos;язати 5 прикладів на додавання
                    двозначних чисел.
                  </p>

                  <p>
                    За правильні відповіді ви отримаєте від 7 до 10 балів
                    залежно від часу виконання.
                  </p>

                  <button
                    type="button"
                    onClick={startExercises}
                    className={styles.primaryButton}
                  >
                    Почати виконання
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className={styles.exerciseStatus}>
                    <div>Вправи: {completed + 1} з 5</div>
                    <div>Результат: {score} балів</div>
                    <div>
                      Час:{" "}
                      <span style={{ color: timerColor }}>
                        {elapsedSeconds} с
                      </span>
                    </div>
                  </div>

                  <div className={styles.workArea}>
                    <div className={styles.leftPanel}>
                      <div className={styles.problem}>
                        <div className={styles.additionTable}>
                          <div className={styles.plusCell}>+</div>

                          <div className={styles.numberCell}>
                            {Math.floor(exercise.first / 10)}
                          </div>
                          <div className={styles.numberCell}>
                            {exercise.first % 10}
                          </div>

                          <div className={styles.numberCell}>
                            {Math.floor(exercise.second / 10)}
                          </div>
                          <div className={styles.numberCell}>
                            {exercise.second % 10}
                          </div>

                          {[0, 1, 2].map((index) => (
                            <div className={styles.answerCell} key={index}>
                              <input
                                ref={(element) => {
                                  inputRefs.current[index] = element;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={answer[index]}
                                onFocus={() => {
                                  activeInputIndex.current = index;
                                }}
                                onChange={(event) =>
                                  updateDigit(index, event.target.value)
                                }
                                onKeyDown={(event) =>
                                  handleKeyDown(event, index)
                                }
                                disabled={checked}
                                placeholder="?"
                                aria-label={
                                  index === 0
                                    ? "Сотні"
                                    : index === 1
                                      ? "Десятки"
                                      : "Одиниці"
                                }
                                autoComplete="off"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={styles.skippedPanel}>
                        <strong>Пропущено:</strong>
                        {skippedCount === 0 ? (
                          <span className={styles.noSkipped}> немає</span>
                        ) : (
                          <div className={styles.skippedList}>
                            {results
                              .filter((item) => item.skipped)
                              .map((item) => (
                                <div key={item.number}>{item.example}</div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.keypad}>
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
                        (digit) => (
                          <button
                            type="button"
                            key={digit}
                            className={styles.keyButton}
                            onClick={() => enterDigit(digit)}
                            disabled={checked}
                          >
                            {digit}
                          </button>
                        ),
                      )}

                      <button
                        type="button"
                        className={`${styles.keyButton} ${styles.deleteButton}`}
                        onClick={deleteDigit}
                        disabled={checked}
                        aria-label="Видалити цифру"
                      >
                        ⌫
                      </button>

                      <button
                        type="button"
                        className={styles.keyButton}
                        onClick={() => enterDigit("0")}
                        disabled={checked}
                      >
                        0
                      </button>

                      <button
                        type="button"
                        className={styles.keyButton}
                        onClick={() => moveInput("left")}
                        disabled={checked}
                        aria-label="Перемістити курсор ліворуч"
                      >
                        ←
                      </button>

                      <button
                        type="button"
                        className={styles.keyButton}
                        onClick={() => moveInput("right")}
                        disabled={checked}
                        aria-label="Перемістити курсор праворуч"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {message && (
                    <div
                      className={`${styles.feedback} ${
                        checked
                          ? message.startsWith("Правильно")
                            ? styles.correct
                            : styles.incorrect
                          : ""
                      }`}
                      role="status"
                    >
                      {message}
                    </div>
                  )}

                  <div className={styles.bottomActions}>
                    {!checked ? (
                      <>
                        <button
                          type="button"
                          onClick={checkAnswer}
                          className={styles.primaryButton}
                        >
                          Перевірити
                        </button>

                        <button
                          type="button"
                          onClick={skipExercise}
                          className={styles.skipButton}
                        >
                          Пропустити
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={nextExercise}
                        className={styles.primaryButton}
                      >
                        Наступний приклад
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer} id="about">
        Математика онлайн — тренуйся та навчайся!
      </footer>
    </div>
  );
}
