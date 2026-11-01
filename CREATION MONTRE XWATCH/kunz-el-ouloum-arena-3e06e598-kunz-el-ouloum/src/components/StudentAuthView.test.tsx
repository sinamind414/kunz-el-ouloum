// StudentAuthView.test.tsx — le défaut signalé le 14/10/2026 :
// « la majorité des élèves ne savent pas s'inscrire avec email ».
//
// Ce que ces tests verrouillent, dans l'ordre d'importance :
//   1. le chemin PAR DÉFAUT ne demande ni adresse e-mail ni mot de passe ;
//   2. l'exemple « eleve@ecole.dz » (adresse scolaire inexistante pour
//      presque tous les élèves) ne revient JAMAIS dans le formulaire ;
//   3. le code attribué est affiché en grand, une seule fois, avant d'entrer ;
//   4. une panne serveur propose de continuer en invité au lieu d'un code
//      d'erreur technique.

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const registerStudentCode = vi.fn();
const loginStudent = vi.fn();
const registerStudent = vi.fn();
const setApiToken = vi.fn();

vi.mock('../utils/api', () => ({
  registerStudentCode: (...args: unknown[]) => registerStudentCode(...args),
  loginStudent: (...args: unknown[]) => loginStudent(...args),
  registerStudent: (...args: unknown[]) => registerStudent(...args),
  setApiToken: (...args: unknown[]) => setApiToken(...args),
}));

import StudentAuthView from './StudentAuthView';

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  onLogin: vi.fn(),
};

beforeEach(() => {
  registerStudentCode.mockReset();
  loginStudent.mockReset();
  registerStudent.mockReset();
  setApiToken.mockReset();
  baseProps.onClose.mockReset();
  baseProps.onLogin.mockReset();
});

afterEach(cleanup);

describe('StudentAuthView — inscription sans adresse e-mail', () => {
  it('s’ouvre sur le chemin « par code », avec 2 champs seulement', () => {
    render(<StudentAuthView {...baseProps} />);
    expect(screen.getByText(/بالرمز/)).toBeTruthy();
    // Aucun champ e-mail visible par défaut…
    expect(screen.queryByPlaceholderText(/gmail/i)).toBeNull();
    // …et le nom est bien demandé (l'enseignant doit pouvoir identifier l'élève).
    expect(screen.getByPlaceholderText(/أحمد بن عمر/)).toBeTruthy();
  });

  it('n’affiche PLUS l’exemple « eleve@ecole.dz » (défaut d’origine)', () => {
    render(<StudentAuthView {...baseProps} />);
    fireEvent.click(screen.getByText(/بالبريد/));
    expect(screen.queryByPlaceholderText('eleve@ecole.dz')).toBeNull();
    // Le champ e-mail reste accessible, mais annoncé comme optionnel.
    expect(screen.getAllByText(/اختياري/).length).toBeGreaterThan(0);
  });

  it('crée le compte sans e-mail et AFFICHE le code avant d’entrer', async () => {
    registerStudentCode.mockResolvedValue({
      token: 'jeton',
      code: 'K7F2-9QX3',
      student: { id: 'stu_1', name: 'أحمد بن عمر', code: 'K7F2-9QX3' },
    });
    render(<StudentAuthView {...baseProps} />);

    fireEvent.change(screen.getByPlaceholderText(/أحمد بن عمر/), { target: { value: 'أحمد بن عمر' } });
    fireEvent.change(screen.getByPlaceholderText('••••••'), { target: { value: '481902' } });
    fireEvent.click(screen.getByText('إنشاء الحساب'));

    await waitFor(() => expect(registerStudentCode).toHaveBeenCalledWith('أحمد بن عمر', '481902'));
    // Le code s'affiche en grand…
    await waitFor(() => expect(screen.getByText('K7F2-9QX3')).toBeTruthy());
    // …et l'élève n'est PAS connecté tant qu'il n'a pas confirmé l'avoir noté.
    expect(baseProps.onLogin).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText(/حفظته/));
    expect(baseProps.onLogin).toHaveBeenCalledWith('أحمد بن عمر', 'K7F2-9QX3');
  });

  it('n’envoie au serveur que 6 chiffres, même si l’élève tape autre chose', async () => {
    registerStudentCode.mockResolvedValue({ token: 't', code: 'AAAA-BBBB', student: { name: 'x' } });
    render(<StudentAuthView {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText(/أحمد بن عمر/), { target: { value: 'سارة' } });
    fireEvent.change(screen.getByPlaceholderText('••••••'), { target: { value: '48-19-02-99' } });
    fireEvent.click(screen.getByText('إنشاء الحساب'));
    await waitFor(() => expect(registerStudentCode).toHaveBeenCalledWith('سارة', '481902'));
  });

  it('explique ce qu’il faut faire quand le serveur refuse (pas de code technique)', async () => {
    registerStudentCode.mockRejectedValue(new Error('weak_pin'));
    render(<StudentAuthView {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText(/أحمد بن عمر/), { target: { value: 'ياسين' } });
    fireEvent.change(screen.getByPlaceholderText('••••••'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('إنشاء الحساب'));
    await waitFor(() => expect(screen.getByText(/الرمز السري يجب أن يكون 6 أرقام/)).toBeTruthy());
    expect(screen.queryByText('weak_pin')).toBeNull();
  });

  it('propose le mode invité quand le serveur n’a plus de stockage', async () => {
    registerStudentCode.mockRejectedValue(new Error('storage_unavailable'));
    render(<StudentAuthView {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText(/أحمد بن عمر/), { target: { value: 'ياسين' } });
    fireEvent.change(screen.getByPlaceholderText('••••••'), { target: { value: '481902' } });
    fireEvent.click(screen.getByText('إنشاء الحساب'));
    await waitFor(() => expect(screen.getByText(/المتابعة كزائر|كزائر/)).toBeTruthy());
  });

  it('en connexion, le champ secret accepte un mot de passe non numérique', async () => {
    // Régression : un compte sans e-mail réinitialisé avec un mot de passe
    // alphabétique était enfermé dehors (le champ effaçait les lettres).
    loginStudent.mockResolvedValue({ token: 't', student: { id: 's', name: 'x', code: 'K7F2-9QX3' } });
    render(<StudentAuthView {...baseProps} />);
    fireEvent.click(screen.getByText(/ادخل من هنا/));
    fireEvent.change(screen.getByPlaceholderText('XXXX-XXXX'), { target: { value: 'K7F2-9QX3' } });
    fireEvent.change(screen.getByPlaceholderText('••••••'), { target: { value: 'motdepasse' } });
    fireEvent.click(screen.getByText('دخول'));
    await waitFor(() => expect(loginStudent).toHaveBeenCalledWith('K7F2-9QX3', 'motdepasse'));
  });

  it('se connecte avec le code (voie par défaut) sans jamais réclamer d’e-mail', async () => {
    loginStudent.mockResolvedValue({
      token: 'jeton',
      student: { id: 'stu_1', name: 'أحمد', code: 'K7F2-9QX3', email: null },
    });
    render(<StudentAuthView {...baseProps} />);
    fireEvent.click(screen.getByText(/ادخل من هنا/)); // register → login
    fireEvent.change(screen.getByPlaceholderText('XXXX-XXXX'), { target: { value: 'k7f2-9qx3' } });
    fireEvent.change(screen.getByPlaceholderText('••••••'), { target: { value: '481902' } });
    fireEvent.click(screen.getByText('دخول'));
    await waitFor(() => expect(loginStudent).toHaveBeenCalledWith('k7f2-9qx3', '481902'));
    expect(baseProps.onLogin).toHaveBeenCalledWith('أحمد', 'K7F2-9QX3');
  });
});
