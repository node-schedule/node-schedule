# Node Schedule

[English](https://github.com/node-schedule/node-schedule/blob/master/README.md)

[![NPM version](http://img.shields.io/npm/v/node-schedule.svg)](https://www.npmjs.com/package/node-schedule)
[![Downloads](https://img.shields.io/npm/dm/node-schedule.svg)](https://www.npmjs.com/package/node-schedule)
[![Build Status](https://github.com/node-schedule/node-schedule/workflows/ci/badge.svg)](https://github.com/node-schedule/node-schedule/actions)
[![Coverage Status](https://coveralls.io/repos/node-schedule/node-schedule/badge.svg?branch=master)](https://coveralls.io/r/node-schedule/node-schedule?branch=master)
[![Join the chat at https://gitter.im/node-schedule/node-schedule](https://img.shields.io/badge/gitter-chat-green.svg)](https://gitter.im/node-schedule/node-schedule?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![NPM](https://nodei.co/npm/node-schedule.png?downloads=true)](https://nodei.co/npm/node-schedule/)

**Node Schedule**是一个包含 cron 和非 cron 的Node.js调度器。
它允许您安排任务（任意函数）以在特定日期执行，并有可选的重复规则。
它只会使用一个计时器在任何给定时间（而不是每秒/分钟重新评估即将到来的工作）。

支持Node 6+.

## 预览

Node Schedule 用于基于时间的调度，而不是基于时间间隔的调度。
虽然你可以很容易地按照自己的意愿进行调整，但如果你只是想做一些类似于 “每 5 分钟运行这个函数”，[toad-scheduler](https://github.com/kibertoad/toad-scheduler) 可能是更好的选择。但是，如果你想说，“在每个月的第三个星期二的每小时的 20 分和 50 分运行这个函数”，你会发现 Node Schedule 更适合你的需求。此外，Node Schedule 支持 Windows，不像真正的cron，因为现在 Node 运行时得到了完全支持。
请注意，Node Schedule 是为进程内调度而设计的，即计划任务只有在你的脚本运行时才会触发，并且当执行完成时，调度将消失。如果你需要安排即使在你的脚本不运行时也能持久化的任务，请考虑使用实际的 [cron]。
如果你需要在重启后仍然持久化的任务以及与多节点部署兼容的锁系统，可以尝试[agenda](https://github.com/agenda/agenda) 或 [bree](https://github.com/breejs/bree).。

## 使用方式

### 安装

你可以使用[npm](https://www.npmjs.com/package/node-schedule)进行安装。
```
npm install node-schedule
```

### 任务与调度

Node Schedule 中的每个计划任务都由一个`Job`对象表示。你可以手动创建任务，然后执行`schedule()`方法应用调度，或者使用方便的函数`scheduleJob()`，如下所示。
`Job`对象是`EventEmitter`，并发出以下事件：
- 每次执行后发出`run`事件。
- 每次计划运行时发出`scheduled`事件。
- 在执行前取消调用时发出`canceled`事件。请注意，`canceled`是美式拼写，只有一个L。
- 当由调度触发的任务调用抛出错误或返回被拒绝的`Promise`时发出`error`事件。
- 当由调度触发的任务调用成功返回或返回已解决的`Promise`时发出`success`事件。在任何情况下，`success`事件接收回调返回的值，或者在Promise的情况下，接收已解决的值。
- （`scheduled`和`canceled`事件都接收一个 `JavaScript` `date`对象作为参数）。请注意，任务在第一次立即调度，所以如果你使用`scheduleJob()`方便方法创建任务，你将错过第一个scheduled事件，但你可以手动查询调用（见下文）。


### Cron风格调度

cron 格式由以下部分组成:

```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
```

cron 格式的示例：

```js
const schedule = require("node-schedule");

const job = schedule.scheduleJob("42 * * * *", function () {
  console.log("The answer to life, the universe, and everything!");
});
```

在分钟为 42 时执行 cron 任务（例如 19:42、20:42 等）。
还有：

```js
const job = schedule.scheduleJob("0 17 ? * 0,4-6", function () {
  console.log("Today is recognized by Rebecca Black!");
});
```

执行每 5 分钟一次的 cron 任务 = _/5 _ \* \* \*。
你还可以获取任务每次调用的计划运行时间：

```js
const job = schedule.scheduleJob("0 1 * * *", function (fireDate) {
  console.log(
    "This job was supposed to run at " +
      fireDate +
      ", but actually ran at " +
      new Date()
  );
});
```

这在系统繁忙时检查任务调用是否有延迟，或者为审计目的保存任务的所有调用记录时很有用。

#### 不支持的Cron特性

目前，`W`（最近的工作日）和`L`（月 / 周的最后一天）不支持。大多数流行的 cron 实现支持的其他功能应该都能正常工作，包括`#`（月中的第 n 个工作日）。
[cron-parser]用于解析 crontab 指令。

### 基于日期的调度

假设你非常具体地希望一个函数在 2012 年 12 月 21 日早上 5:30 执行。记住，在 JavaScript 中，0 代表一月，11 代表十二月。

```js
const schedule = require("node-schedule");
const date = new Date(2012, 11, 21, 5, 30, 0);

const job = schedule.scheduleJob(date, function () {
  console.log("The world is going to end today.");
});
```

为了在将来使用当前数据，你可以使用绑定：

```js
const schedule = require("node-schedule");
const date = new Date(2012, 11, 21, 5, 30, 0);
const x = "Tada!";
const job = schedule.scheduleJob(
  date,
  function (y) {
    console.log(y);
  }.bind(null, x)
);
x = "Changing Data";
```

当计划任务运行时，这将记录 “Tada!”，而不是 “Changing Data”，因为在调度后，x 立即变为 “Changing Data”。

### 重复规则调度

你可以构建重复规则来指定任务何时重复。例如，考虑这个规则，它在每小时的 42 分钟执行函数：

```js
const schedule = require("node-schedule");

const rule = new schedule.RecurrenceRule();
rule.minute = 42;

const job = schedule.scheduleJob(rule, function () {
  console.log("The answer to life, the universe, and everything!");
});
```

你也可以使用数组来指定可接受的值列表，并使用Range对象来指定开始和结束值的范围，以及可选的步长参数。例如，这将在周四、周五、周六和周日的下午 5 点打印一条消息：

```js
const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = 17;
rule.minute = 0;

const job = schedule.scheduleJob(rule, function () {
  console.log("Today is recognized by Rebecca Black!");
});
```

也支持时区。以下是在 UTC 时区每天开始时执行的示例。

```js
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.tz = "Etc/UTC";

const job = schedule.scheduleJob(rule, function () {
  console.log("A new day has begun in the UTC timezone!");
});
```

可接受的 tz（时区）值列表可以在<https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>找到。

#### 重复规则参数

- `second (0-59)`
- `minute (0-59)`
- `hour  (0-23)`
- `date  (1-31)`
- `month (0-11)`
- `year`
- `dayOfWeek (0-6) Starting with Sunday`
- `tz`

> **注意**: 值得注意的是，重复规则的一个组件的默认值是`null`（除了秒，为了与 `cron` 熟悉，默认值为 0）。如果我们没有明确将`minute`设置为 0，那么消息将在下午 5:00、5:01、5:02 等，直到下午 5:59 被记录。这可能不是你想要的。

#### 对象字面量语法

为了让事情更简单，也支持对象字面量语法，例如，这个示例将在每个周日下午 2:30 记录一条消息：

```js
const job = schedule.scheduleJob(
  { hour: 14, minute: 30, dayOfWeek: 0 },
  function () {
    console.log("Time for tea!");
  }
);
```

#### 设置起始终止时间

在这个示例中，它将在 5 秒后运行，并在 10 秒后停止。ruledat 支持上述功能。

```js
const startTime = new Date(Date.now() + 5000);
const endTime = new Date(startTime.getTime() + 5000);
const job = schedule.scheduleJob(
  { start: startTime, end: endTime, rule: "*/1 * * * * *" },
  function () {
    console.log("Time for tea!");
  }
);
```

### 优雅的关闭

你可以优雅地关闭任务。
`gracefulShutdown()`将取消所有任务并返回 Promise。它将等待直到所有任务都终止。

```js
schedule.gracefulShutdown();
```

你也可以在系统中断时优雅地关闭任务。

```
process.on('SIGINT', function () {
  schedule.gracefulShutdown()
  .then(() => process.exit(0))
}
```

### 处理任务

有一些函数可以获取任务的信息，并处理和调用任务。

#### job.cancel(reschedule)

你可以使用`cancel()`方法使任何任务无效：

```js
j.cancel();
```

所有计划的调用都将被取消。当你将参数**_reschedule_**设置为 true 时，任务将在之后重新调度。

#### job.cancelNext(reschedule)

这个方法使下一个计划的调用或任务无效。当你将参数**_reschedule_**设置为 true 时，任务将在之后重新调度。

#### job.reschedule(spec)

这个方法取消所有待处理的调用，并使用给定的规范重新完全注册任务。成功 / 失败时返回 true/false。

#### job.nextInvocation()

这个方法返回这个任务的下一个计划调用的日期对象。如果没有计划调用，这个方法返回 null。

## 贡献（原文）

This module was originally developed by [Matt Patenaude] who eventually passed over maintainer's mantle over to [Tejas Manohar].

Currently it is being maintained by [Igor Savin] and [our amazing community].

We'd love to get your contributions. Individuals making significant and valuable
contributions are given commit-access to the project to contribute as they see fit.

Before jumping in, check out our [Contributing] page guide!

## 版权和许可

Copyright 2015 Matt Patenaude.

Licensed under the **[MIT License](https://github.com/node-schedule/node-schedule/blob/master/LICENSE)**.

[cron]: http://unixhelp.ed.ac.uk/CGI/man-cgi?crontab+5
[Contributing]: https://github.com/node-schedule/node-schedule/blob/master/CONTRIBUTING.md
[Matt Patenaude]: https://github.com/mattpat
[Tejas Manohar]: http://tejas.io
[Igor Savin]: https://twitter.com/kibertoad
[our amazing community]: https://github.com/node-schedule/node-schedule/graphs/contributors
[cron-parser]: https://github.com/harrisiirak/cron-parser
