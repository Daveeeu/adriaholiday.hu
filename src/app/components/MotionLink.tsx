import { motion } from "motion/react";
import { Link } from "react-router";

/** A router link that takes motion props (hover/tap animations) like motion.button. */
const MotionLink = motion.create(Link);

export default MotionLink;
