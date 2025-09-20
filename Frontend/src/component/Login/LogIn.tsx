import { useState } from "react";
import {
  Dialog,
  DialogContent,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "sonner";
import { Link as MuiLink } from "@mui/material";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../Firebase";
import "./LogIn.css";
import GoogleLogo from "../../assets/Google.png";

type LoginProps = {
  open: boolean;
  handleClose: () => void;
  onSignupClick: () => void;
  onLoginSuccess?: () => void;
};

export default function LogIn({
  open,
  handleClose,
  onSignupClick,
  onLoginSuccess,
}: LoginProps) {
  const [User, setUser] = useState({ Email: "", Pass: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const api = import.meta.env.VITE_API_BASE_URL;

  // ✅ Email/Password login
  async function HandleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!User.Email.trim()) newErrors.Email = "Email is required";
    if (!User.Pass.trim()) newErrors.Pass = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      setLoading(true);
      const response = await fetch(`${api}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: User.Email, password: User.Pass }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Login Successful! 🎉");
        localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        handleClose();
        if (onLoginSuccess) onLoginSuccess();
      } else {
        toast.error(data.message || "Invalid email or password ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const response = await fetch(`${api}/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Google Login Successful 🎉");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        handleClose();
        if (onLoginSuccess) onLoginSuccess();
      } else toast.error(data.message || "Google login failed ❌");
    } catch (err) {
      console.error(err);
      toast.error("Google login error ❌");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}  >
      <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Grid container >
          {/* Left Section */}
          <Grid
            className="BgImg"
            item
            xs={12}
            sm={12}
            md={5}
            lg={6}
            sx={{
              color: "white",
              display: "flex",
              flexDirection: "column",
              px: 4,
              
              height:{xs:"350px", md:"600px",lg:"580px" ,sm:"300px"}
            }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              Login to your account
            </Typography>
            <Typography variant="body1" sx={{ fontSize: "14px", opacity: 0.9 }}>
              Get access to your orders, wishlist, and recommendations
            </Typography>
          </Grid>

          {/* Right Section */}
          <Grid
            item
            xs={12}
            sm={12}
            md={7}
            lg={6}
            sx={{
             
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 5,
                width: "100%",
                maxWidth: 400,
                borderRadius: 1.5,
                backgroundColor: "white",
               
              }}
            >
              <form onSubmit={HandleSubmit} noValidate>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  variant="standard"
                  margin="normal"
                  value={User.Email}
                  onChange={(e) => setUser({ ...User, Email: e.target.value })}
                  error={!!errors.Email}
                  helperText={errors.Email}
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="standard"
                  margin="normal"
                  value={User.Pass}
                  onChange={(e) => setUser({ ...User, Pass: e.target.value })}
                  error={!!errors.Pass}
                  helperText={errors.Pass}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: "#fb641b",
                    "&:hover": { bgcolor: "#e55300" },
                    py: 1.5,
                    fontWeight: "bold",
                    mt: 2,
                    mb: 2,
                    textTransform: "none",
                    borderRadius: 1,
                  }}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <Divider sx={{ my: 2 }}>OR</Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleGoogleLogin}
                  sx={{
                    py: 1.5,
                    fontWeight: "bold",
                    textTransform: "none",
                    borderRadius: 1,
                    fontSize:13
                  }}
                >
                  <Box component="img" src={GoogleLogo} width="20px" mx={1} /> Continue with Google
                </Button>

                <Typography textAlign="center" variant="body2" sx={{ mt: 2 }}>
                  New to Flipkart?{" "}
                  <MuiLink
                    component="button"
                    sx={{ color: "#2874f0", fontWeight: "bold", textDecoration: "none" }}
                    onClick={onSignupClick}
                  >
                    Create an account
                  </MuiLink>
                </Typography>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
