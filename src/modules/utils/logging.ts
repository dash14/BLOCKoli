/* v8 ignore file -- @preserve */
import logging from "loglevel";
import prefixer from "loglevel-plugin-prefix";

logging.setDefaultLevel(
  import.meta.env.MODE === "development"
    ? logging.levels.DEBUG
    : logging.levels.WARN
);

const log = logging.noConflict();
prefixer.reg(log);
prefixer.apply(log, {
  template: "[%t] %l: [%n]",
});

export default logging;
