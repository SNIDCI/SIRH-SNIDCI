import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { PayslipLine } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#16202B" },
  header: { marginBottom: 24, borderBottom: 2, borderBottomColor: "#3A6B58", paddingBottom: 12 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#16202B" },
  subtitle: { fontSize: 10, color: "#5B6B6A", marginTop: 2 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  infoBlock: { width: "48%" },
  infoLabel: { fontSize: 8, color: "#5B6B6A", textTransform: "uppercase", marginBottom: 2 },
  infoValue: { fontSize: 11, marginBottom: 8 },
  table: { marginTop: 10, borderTop: 1, borderTopColor: "#DDE3E0" },
  tableHeader: { flexDirection: "row", backgroundColor: "#F4F6F4", paddingVertical: 6, paddingHorizontal: 8 },
  tableHeaderText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#5B6B6A", textTransform: "uppercase" },
  tableRow: {
    flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8,
    borderBottom: 1, borderBottomColor: "#DDE3E0",
  },
  colLabel: { width: "70%" },
  colAmount: { width: "30%", textAlign: "right" },
  netRow: {
    flexDirection: "row", justifyContent: "space-between", marginTop: 16,
    paddingVertical: 10, paddingHorizontal: 8, backgroundColor: "#E4EEE8",
  },
  netLabel: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  netAmount: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#274A3E" },
  footer: { marginTop: 30, fontSize: 8, color: "#5B6B6A" },
});

export function PayslipPdf({
  companyName,
  periodLabel,
  employeeName,
  employeeRole,
  lines,
  netSalary,
}: {
  companyName: string;
  periodLabel: string;
  employeeName: string;
  employeeRole: string;
  lines: PayslipLine[];
  netSalary: number;
}) {
  const formatAmount = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " F";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{companyName}</Text>
          <Text style={styles.subtitle}>Bulletin de paie — {periodLabel}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Employé</Text>
            <Text style={styles.infoValue}>{employeeName}</Text>
            <Text style={styles.infoLabel}>Poste</Text>
            <Text style={styles.infoValue}>{employeeRole || "—"}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Période</Text>
            <Text style={styles.infoValue}>{periodLabel}</Text>
            <Text style={styles.infoLabel}>Date d&apos;émission</Text>
            <Text style={styles.infoValue}>
              {new Date().toLocaleDateString("fr-FR")}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colLabel]}>Libellé</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Montant</Text>
          </View>
          {lines.map((l, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colLabel}>{l.label}</Text>
              <Text style={styles.colAmount}>{formatAmount(l.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.netRow}>
          <Text style={styles.netLabel}>Net à payer</Text>
          <Text style={styles.netAmount}>{formatAmount(netSalary)}</Text>
        </View>

        <Text style={styles.footer}>
          Document généré automatiquement à partir des données saisies par le service RH —
          conservez ce bulletin.
        </Text>
      </Page>
    </Document>
  );
}
