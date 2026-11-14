import type { RoleTemplate } from "../role-template";

export const embeddedEngineer: RoleTemplate = {
  id: "embedded-engineer",
  title: "Embedded and robotics engineer",
  keywords: [
    "embedded", "firmware", "robotics engineer", "robotics", "ros", "ros2", "rtos", "microcontroller",
    "real-time", "sulautettu", "sulautetut", "sulautettujen", "robotiikka", "robotiikkainsinööri",
  ],
  skills: ["embedded-constraints", "safety-thinking", "code-review", "testing", "ai-assisted-work"],
  why: {
    "embedded-constraints": "A control loop that misses its deadline moves a real motor at the wrong moment.",
    "safety-thinking": "When a sensor goes quiet, the robot has to stop on its own.",
  },
  lookFor: {
    "embedded-constraints": "Notices blocking calls, shared data without protection and timing that drifts under load.",
    "safety-thinking": "Says what the robot does when data is stale or missing, and makes sure it ends in a safe state.",
  },
  constraints: [
    "the controller had only 2 KB of free RAM",
    "the robot shares the aisle with people during the day shift",
    "you could not change the motor driver firmware",
    "the fix had to ship as an over-the-air update tonight",
  ],
  challenge: {
    title: "Review an AI-written motor control loop",
    format: "review",
    brief:
      "Our mobile robots stop for obstacles using a front distance sensor. A teammate asked an AI assistant to rewrite the drive loop on the motor controller. It ran fine on the test bench. Before it goes to robots that share aisles with people, we want a careful review.",
    material: {
      kind: "code",
      title: "drive_loop.c",
      body: [
        "volatile uint16_t front_mm;      /* written by the sensor ISR */",
        "static uint32_t last_sensor_ms;  /* set by the sensor ISR */",
        "",
        "void sensor_isr(void) {",
        "    front_mm = read_distance_mm();",
        "    last_sensor_ms = millis();",
        "    log_printf(\"front=%u\\n\", front_mm);",
        "}",
        "",
        "void drive_loop(void) {           /* called every 10 ms */",
        "    uint16_t speed = target_speed;",
        "    if (front_mm < 400) {",
        "        speed = 0;",
        "    }",
        "    set_motor_speed(speed);",
        "}",
        "",
        "int main(void) {",
        "    init_sensor_irq(sensor_isr);",
        "    while (1) {",
        "        drive_loop();",
        "        delay_ms(10);",
        "    }",
        "}",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "no stop when the sensor data goes stale",
        cues: ["stale", "last_sensor_ms", "timeout", "watchdog", "sensor fails", "no data", "disconnected", "safe state", "fail safe", "fail-safe"],
      },
      {
        label: "the blocking log call inside the interrupt",
        cues: ["printf", "log_printf", "inside the isr", "in the interrupt", "blocking", "isr should be short", "uart"],
      },
      {
        label: "loop timing that drifts because of the fixed delay",
        cues: ["delay_ms", "drift", "jitter", "timer", "fixed rate", "period", "10 ms", "deadline"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a sensor read",
    format: "review",
    brief: "An AI assistant wrote this to read a temperature sensor on a motor driver.",
    material: {
      kind: "code",
      title: "temp.c",
      body: [
        "uint8_t read_temp_c(void) {",
        "    while (!i2c_ready()) { }",
        "    return i2c_read(TEMP_SENSOR_ADDR);",
        "}",
        "/* motor is cut if read_temp_c() > 90 */",
      ].join("\n"),
    },
    deliverable: "What is the one thing you would change first, and why?",
    flaws: [
      {
        label: "the busy wait with no timeout",
        cues: ["timeout", "busy wait", "busy-wait", "hang", "forever", "infinite loop", "never returns", "stuck", "watchdog"],
      },
    ],
  },
};
