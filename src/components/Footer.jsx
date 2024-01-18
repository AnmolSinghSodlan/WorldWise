import styles from "./Footer.module.css";

function Footer() {
  return (
    <div className={styles.footer}>
      <p className={styles.copyright}>
        &copy; Cpoyright {new Date().getFullYear()} by WorldWise Inc.
      </p>
    </div>
  );
}

export default Footer;
