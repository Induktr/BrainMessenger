import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'; // Keep Head if needed for SEO/title
import { NextSeo } from 'next-seo'; // Keep NextSeo
import { useMutation, gql, useApolloClient } from '@apollo/client'; // Import useApolloClient

// Updated REGISTER mutation to return UserDto fields
const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      id      # Returns UserDto
      name
      email
    }
  }
`;

// Renamed to RESEND_VERIFICATION_CODE_MUTATION and matches backend
const RESEND_VERIFICATION_CODE_MUTATION = gql`
  mutation ResendVerificationCode($email: String!) {
    resendVerificationCode(email: $email) # Returns boolean
  }
`;

const VERIFY_EMAIL = gql`
  mutation VerifyEmail($email: String!, $code: String!) {
    verifyEmail(email: $email, code: $code) { # Pass code argument
      access_token # Returns LoginResponse
      user {
        id
        name
        email
        isVerified # Include isVerified from backend User DTO
      }
    }
  }
`;

const RegistrationPage = () => {
  const router = useRouter();
  const client = useApolloClient(); // Get Apollo Client instance
  const [step, setStep] = useState(1); // 1: Password, 2: Name, 3: Email, 4: Code // Re-added useState for step
  const [formData, setFormData] = useState({
    password: '',
    name: '',
    email: '',
  });
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errors, setErrors] = useState({ // State for validation/API errors
    password: '',
    name: '',
    email: '',
    confirmationCode: '',
    api: '',
  });
  const [isLoading, setIsLoading] = useState(false); // Combined loading state

  // --- Icons (Placeholders - replace with actual paths/components) ---
  const icons = {
    logo: 'https://res.cloudinary.com/dsjalneil/image/upload/v1739618043/BrainMessengerLogo_yuxq6c.png',
    password: <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_704_73)">
<path d="M13.5697 0.594049C15.38 0.500356 17.2159 1.33806 18.4857 2.59849C20.3114 4.41075 20.6272 6.45187 20.6264 8.86064L20.6261 11.1373C20.7933 11.1518 21.8541 11.1564 21.9641 11.126C22.3046 11.032 23.4727 10.0847 23.9635 9.75971C24.7726 10.5814 25.6726 11.8395 26.396 12.756L27.9014 14.6538C28.0548 14.844 28.8379 15.6845 28.8365 15.8942L28.8364 22.0725C28.8367 22.2748 28.8598 22.4855 28.8362 22.6862C28.5804 22.923 28.2623 23.1222 27.9806 23.328L22.3869 27.4778C21.4553 28.1771 20.8414 28.5588 20.0294 29.4033L19.0304 30.4346C18.6334 30.901 17.7561 31.8519 17.3016 32.2336C16.9005 32.2593 16.48 32.2339 16.0766 32.2338H11.1467C10.1381 32.2338 10.0731 32.4679 9.40463 31.788L4.58 26.9683C4.45292 26.8438 4.30942 26.7284 4.19716 26.5902L4.19679 15.042C4.19674 14.5473 4.16288 14.0218 4.22477 13.5311C4.3707 12.3744 5.34339 11.3817 6.48437 11.1731C6.48437 9.94939 6.45997 8.72064 6.48405 7.49752C6.55737 3.77389 9.84113 0.523654 13.5697 0.594049ZM12.338 21.7751H6.48437L6.48465 24.3765C6.48478 24.8006 6.50995 25.2399 6.48437 25.6623C6.90319 26.0603 7.29632 26.4825 7.70232 26.8931L9.98957 29.169C10.2679 29.4408 10.5321 29.7408 10.8212 29.9996C11.3267 30.0053 11.8325 29.9993 12.338 29.9996L14.9093 30C15.324 30.0001 15.7514 30.0219 16.1651 29.9996C16.7767 29.3841 17.5173 28.4237 18.1802 27.9119C18.0086 27.7483 17.8663 27.5528 17.7177 27.3685L14.326 23.1206C14.0419 22.76 13.5749 22.0582 13.2481 21.7751C12.9448 21.7713 12.6413 21.7742 12.338 21.7751ZM13.3853 2.86694C10.9102 2.99793 8.95194 4.87828 8.78007 7.35477C8.74807 7.81627 8.76719 8.28814 8.76719 8.75071L8.76769 11.1373H13.7211L16.778 11.1368C17.2939 11.1368 17.8132 11.1235 18.3286 11.1373L18.3292 8.79352C18.3289 7.00721 18.2637 5.6308 16.8813 4.24344C15.9873 3.34622 14.6604 2.79364 13.3853 2.86694ZM18.9303 13.2473C18.0693 13.2315 17.2053 13.2474 16.3438 13.2475L8.3575 13.2475C7.56444 13.2475 6.49473 13.0007 6.48506 14.0693L6.48437 19.5009C6.66097 19.4976 6.83725 19.4928 7.01382 19.5009L11.1437 19.5015C11.3126 19.5016 11.4851 19.512 11.6534 19.5009C11.5252 19.2838 11.35 19.1131 11.2014 18.9123C11.772 18.4648 12.3783 18.059 12.9618 17.6278L18.288 13.746C18.4465 13.633 18.8983 13.3565 18.9869 13.2329C18.9644 13.2357 18.9509 13.2371 18.9303 13.2473ZM23.4691 12.7528C23.125 12.9925 22.7917 13.2479 22.451 13.4925L16.2536 17.9463C15.6063 18.4111 14.9692 18.8903 14.3134 19.3432C14.7686 20.014 15.3034 20.6398 15.802 21.2788L16.4631 22.1215C16.5109 22.1816 16.7622 22.5506 16.8202 22.5196C17.0303 22.3208 17.2913 22.159 17.5261 21.9893L24.2026 17.1443C24.7644 16.7272 25.4765 16.2871 25.9945 15.8469L24.2563 13.6748C24.0826 13.4601 23.6663 12.8932 23.4691 12.7528ZM26.6031 18.1884C26.1665 18.3993 25.8144 18.7208 25.4268 19.0041L18.8082 23.8061C18.5958 23.9633 18.3974 24.1401 18.1802 24.2905C18.5141 24.7054 18.838 25.1323 19.1784 25.5413C19.3764 25.789 19.6906 26.2334 19.9166 26.4304L25.8968 22.0593C26.1321 21.8863 26.3909 21.7197 26.6031 21.5191C26.6031 21.2113 26.6187 18.2123 26.6068 18.1893L26.6031 18.1884Z" fill="#F0F0F0"/>
</g>
<defs>
<clipPath id="clip0_704_73">
<rect width="32" height="32" fill="white" transform="translate(0.5 0.5)"/>
</clipPath>
</defs>
</svg>,
    name: <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.9156 14.1476C12.2151 14.1144 12.5395 14.1379 12.8414 14.1386L14.5631 14.1395L20.551 14.1392C22.806 14.1331 24.8441 14.9833 26.4431 16.5794C27.684 17.8179 28.5563 19.4347 28.7875 21.1814C28.8781 21.8651 28.8743 22.56 28.8753 23.2483C28.0946 23.2304 27.3134 23.2425 26.5325 23.2349C26.5148 22.7866 26.5157 22.3391 26.476 21.8917C26.3458 20.4292 25.8401 19.2685 24.8076 18.2206C24.7456 18.1588 24.6823 18.0984 24.6176 18.0394C24.553 17.9803 24.4872 17.9227 24.4201 17.8665C24.353 17.8103 24.2847 17.7556 24.2152 17.7023C24.1457 17.6491 24.0752 17.5973 24.0035 17.5471C23.9317 17.4969 23.859 17.4483 23.7852 17.4012C23.7114 17.3542 23.6366 17.3087 23.5609 17.2649C23.4851 17.221 23.4084 17.1788 23.3309 17.1382C23.2533 17.0977 23.1749 17.0588 23.0956 17.0217C23.0164 16.9845 22.9364 16.9491 22.8556 16.9154C22.7748 16.8817 22.6933 16.8497 22.6112 16.8195C22.529 16.7893 22.4463 16.7609 22.3629 16.7342C22.2795 16.7076 22.1956 16.6828 22.1111 16.6597C22.0267 16.6367 21.9418 16.6156 21.8564 16.5962C21.7711 16.5768 21.6853 16.5593 21.5992 16.5437C21.5131 16.528 21.4267 16.5142 21.34 16.5023C21.2532 16.4903 21.1663 16.4803 21.0791 16.4721C20.5432 16.4172 19.9932 16.4306 19.4547 16.4271L15.5475 16.4396L13.6668 16.4393C12.7123 16.4394 11.7464 16.4209 10.8191 16.6831C9.86721 16.9522 9.00846 17.4905 8.30827 18.184C8.27385 18.2177 8.23985 18.2518 8.20627 18.2864C8.17269 18.321 8.13952 18.3559 8.10677 18.3913C8.07406 18.4267 8.04179 18.4624 8.00996 18.4986C7.97812 18.5348 7.94673 18.5714 7.91577 18.6083C7.88481 18.6453 7.85433 18.6826 7.82433 18.7202C7.79429 18.7579 7.76473 18.796 7.73564 18.8344C7.70656 18.8728 7.67794 18.9116 7.64977 18.9507C7.62164 18.9899 7.594 19.0293 7.56683 19.0692C7.53966 19.109 7.513 19.1491 7.48683 19.1896C7.46066 19.23 7.435 19.2708 7.40983 19.3119C7.38466 19.3529 7.36 19.3943 7.33583 19.4361C7.31166 19.4778 7.28802 19.5198 7.26489 19.5621C7.24177 19.6043 7.21916 19.6469 7.19708 19.6897C7.17504 19.7326 7.1535 19.7757 7.13246 19.819C7.11146 19.8624 7.09098 19.906 7.07102 19.9499C7.0511 19.9937 7.03171 20.0378 7.01283 20.0822C6.994 20.1266 6.97569 20.1711 6.95789 20.2159C6.94014 20.2607 6.92296 20.3057 6.90633 20.3509C6.88966 20.3962 6.87356 20.4416 6.85802 20.4872C6.84248 20.5328 6.82752 20.5786 6.81314 20.6246C6.79873 20.6706 6.78487 20.7168 6.77158 20.7631C6.75833 20.8094 6.74564 20.8559 6.7335 20.9026C6.72137 20.9492 6.70982 20.9959 6.69884 21.0429C6.68787 21.0898 6.67747 21.1369 6.66765 21.1841C6.65783 21.2312 6.6486 21.2785 6.63994 21.3259C6.63129 21.3733 6.62321 21.4208 6.61573 21.4684C6.60824 21.5161 6.60134 21.5637 6.59503 21.6115C6.58872 21.6593 6.58299 21.7071 6.57786 21.7551C6.57272 21.803 6.56817 21.8509 6.56422 21.899C6.56026 21.947 6.5569 21.9951 6.55413 22.0432C6.55135 22.0913 6.54918 22.1394 6.54759 22.1876C6.546 22.2357 6.545 22.2839 6.5446 22.3321L6.54522 26.1799L6.54394 27.3231C6.54374 27.6102 6.52811 27.908 6.57704 28.1917C6.62156 28.4499 6.72807 28.6854 6.91552 28.8715C7.14133 29.0956 7.41996 29.1971 7.72777 29.2531C8.32664 29.3622 8.95221 29.2903 9.55808 29.288L12.6322 29.2892L21.3541 29.2967L23.8683 29.2979C24.3277 29.2986 24.8154 29.3339 25.27 29.2766C25.5553 29.2407 25.8348 29.1252 26.0422 28.9231C26.6591 28.322 26.5188 27.2762 26.5305 26.4902C26.7966 26.4846 27.065 26.4941 27.3314 26.4943C27.8433 26.4948 28.3551 26.492 28.867 26.4859C28.8888 26.7962 28.887 27.115 28.8814 27.4259C28.8624 28.4986 28.6743 29.3982 27.952 30.2381C27.134 31.1889 26.3516 31.4863 25.1301 31.5806C24.708 31.6131 24.2751 31.5981 23.8518 31.5986L21.7191 31.6012L14.7719 31.608L9.83952 31.6025L8.42064 31.5988C8.04983 31.5976 7.67408 31.6095 7.30608 31.5567C7.22087 31.5447 7.13619 31.5297 7.05202 31.5117C6.96785 31.4937 6.88444 31.4728 6.80177 31.4489C6.71912 31.4249 6.63742 31.3981 6.55665 31.3684C6.47589 31.3387 6.39628 31.3062 6.31783 31.2708C6.23937 31.2354 6.16226 31.1973 6.08651 31.1566C6.01076 31.1157 5.93655 31.0722 5.86388 31.0261C5.79121 30.98 5.72027 30.9314 5.65105 30.8803C5.58183 30.8292 5.51451 30.7757 5.44909 30.7197C4.62521 30.0079 4.21165 29.0355 4.13604 27.9624C4.11148 27.6138 4.11939 27.259 4.11719 26.9093L4.12396 24.6501C4.12658 22.5954 3.98655 20.8561 4.89261 18.9333C4.97958 18.7516 5.0727 18.5731 5.17199 18.3979C5.27127 18.2226 5.37646 18.051 5.48758 17.8829C5.5987 17.7149 5.71547 17.5509 5.83789 17.391C5.96032 17.231 6.08811 17.0755 6.22126 16.9243C7.36171 15.6157 8.97452 14.6382 10.6786 14.2908C11.088 14.2074 11.4995 14.1762 11.9156 14.1476Z" fill="#F0F0F0"/>
<path d="M15.8848 0.115668C16.0887 0.0913419 16.3121 0.105322 16.5173 0.107828C17.9034 0.12475 19.3174 0.520086 20.4268 1.36942C21.8824 2.48383 22.9547 4.2004 23.1935 6.03059C23.4259 7.81173 22.9678 9.54366 21.8673 10.9674C20.6127 12.5904 19.1029 13.3631 17.0852 13.6189C17.0638 13.6212 17.0424 13.6233 17.0209 13.6251C16.967 13.6295 16.9131 13.6332 16.8591 13.6362C16.8052 13.6392 16.7512 13.6416 16.6971 13.6434C16.6431 13.6451 16.589 13.6461 16.5349 13.6465C16.4809 13.6469 16.4268 13.6466 16.3727 13.6457C16.3187 13.6447 16.2647 13.6431 16.2107 13.6409C16.1566 13.6386 16.1026 13.6357 16.0487 13.632C15.9948 13.6285 15.9409 13.6242 15.887 13.6193C15.8332 13.6144 15.7794 13.6089 15.7257 13.6026C15.672 13.5964 15.6184 13.5895 15.5649 13.582C15.5113 13.5744 15.4579 13.5662 15.4045 13.5574C15.3512 13.5485 15.298 13.539 15.2449 13.5289C15.1918 13.5187 15.1388 13.5079 15.086 13.4964C15.0332 13.485 14.9805 13.4728 14.9279 13.46C14.8754 13.4473 14.823 13.4339 14.7708 13.4199C14.7185 13.4059 14.6665 13.3912 14.6147 13.3759C14.5628 13.3605 14.5112 13.3446 14.4597 13.328C14.4083 13.3115 14.357 13.2942 14.306 13.2764C14.2549 13.2585 14.2041 13.2401 14.1535 13.221C14.103 13.2019 14.0526 13.1822 14.0025 13.1619C13.9524 13.1416 13.9026 13.1206 13.853 13.0991C13.8034 13.0776 13.7541 13.0554 13.705 13.0327C13.6559 13.0099 13.6072 12.9866 13.5587 12.9626C13.5103 12.9386 13.4621 12.9141 13.4142 12.889C13.3664 12.8639 13.3188 12.8381 13.2715 12.8119C13.2243 12.7856 13.1774 12.7587 13.1309 12.7312C13.0843 12.7038 13.038 12.6757 12.9921 12.6472C12.9462 12.6186 12.9007 12.5895 12.8555 12.5598C12.8103 12.5301 12.7655 12.4998 12.7211 12.469C12.6767 12.4382 12.6326 12.4069 12.5889 12.375C12.5453 12.3431 12.502 12.3107 12.4591 12.2778C12.4162 12.2448 12.3738 12.2114 12.3317 12.1774C12.2897 12.1434 12.2481 12.1089 12.2069 12.0739C10.8075 10.8945 9.90748 9.25829 9.7543 7.42941C9.75005 7.37387 9.74649 7.31829 9.74361 7.26266C9.74074 7.20708 9.73853 7.15146 9.73698 7.09579C9.73544 7.04008 9.73459 6.98439 9.73442 6.92873C9.73421 6.87302 9.73469 6.81733 9.73586 6.76166C9.73703 6.706 9.73886 6.65033 9.74136 6.59466C9.74386 6.53904 9.74705 6.48346 9.75092 6.42791C9.75476 6.37233 9.75928 6.31681 9.76449 6.26135C9.76969 6.20592 9.77557 6.15055 9.78211 6.09524C9.78865 6.03994 9.79586 5.98472 9.80373 5.92958C9.81161 5.87445 9.82015 5.81942 9.82936 5.76449C9.83857 5.70957 9.84842 5.65476 9.85892 5.60008C9.86946 5.54539 9.88067 5.49084 9.89255 5.43643C9.90438 5.38201 9.9169 5.32774 9.93011 5.27363C9.94328 5.21952 9.95709 5.16557 9.97155 5.11179C9.98605 5.05802 10.0012 5.00443 10.0169 4.95101C10.0327 4.8976 10.0491 4.84439 10.0662 4.79138C10.0833 4.73836 10.101 4.68556 10.1193 4.63298C10.1376 4.58039 10.1566 4.52804 10.1762 4.47591C10.1959 4.42379 10.2161 4.37191 10.2369 4.32027C10.2578 4.26864 10.2793 4.21726 10.3014 4.16614C10.3235 4.11503 10.3462 4.06419 10.3696 4.01363C10.3929 3.96306 10.4169 3.91278 10.4414 3.8628C10.466 3.81282 10.4912 3.76314 10.5169 3.71376C10.5427 3.66439 10.569 3.61533 10.596 3.56659C10.6229 3.51786 10.6505 3.46945 10.6786 3.42138C10.7067 3.37331 10.7354 3.32559 10.7647 3.27821C10.794 3.23084 10.8238 3.18382 10.8542 3.13717C10.8847 3.09052 10.9156 3.04424 10.9472 2.99834C10.9787 2.95244 11.0108 2.90693 11.0434 2.8618C11.0761 2.81668 11.1093 2.77195 11.143 2.72763C11.1767 2.68331 11.2109 2.6394 11.2457 2.59591C11.2805 2.55242 11.3158 2.50935 11.3517 2.46671C11.3869 2.42504 11.4227 2.3838 11.4589 2.343C11.4951 2.3022 11.5319 2.26185 11.5691 2.22194C11.6063 2.18204 11.644 2.1426 11.6822 2.10361C11.7204 2.06463 11.759 2.02612 11.7982 1.98808C11.8373 1.95004 11.8769 1.91248 11.9169 1.87541C11.957 1.83833 11.9975 1.80175 12.0384 1.76567C12.0793 1.72958 12.1207 1.694 12.1625 1.65893C12.2043 1.62385 12.2466 1.58929 12.2892 1.55524C12.3319 1.5212 12.3749 1.48768 12.4184 1.45468C12.4619 1.42169 12.5057 1.38923 12.55 1.35731C12.5942 1.32538 12.6389 1.294 12.6839 1.26317C12.7289 1.23233 12.7743 1.20205 12.8201 1.17233C12.8659 1.1426 12.912 1.11343 12.9585 1.08483C13.0049 1.05623 13.0518 1.0282 13.0989 1.00074C13.1461 0.973286 13.1936 0.946407 13.2414 0.920107C13.2892 0.893807 13.3373 0.868094 13.3858 0.842969C13.4342 0.817844 13.4829 0.793315 13.532 0.769382C13.581 0.745444 13.6304 0.722111 13.68 0.699382C13.7296 0.676649 13.7795 0.654526 13.8296 0.633013C13.8798 0.611498 13.9302 0.590598 13.9809 0.570314C14.0315 0.550031 14.0824 0.530368 14.1335 0.511327C14.1847 0.492285 14.2361 0.47387 14.2877 0.456082C14.3393 0.438295 14.391 0.421139 14.443 0.404616C14.495 0.388092 14.5473 0.372205 14.5997 0.356956C14.6521 0.341706 14.7047 0.327098 14.7574 0.313132C14.8102 0.299165 14.8631 0.285845 14.9162 0.27317C14.9693 0.260495 15.0225 0.248469 15.0759 0.237093C15.1292 0.225717 15.1827 0.214994 15.2364 0.204924C15.29 0.194854 15.3437 0.18544 15.3976 0.176682C15.4514 0.167924 15.5054 0.159824 15.5595 0.152382C15.6135 0.144941 15.6677 0.13816 15.7219 0.13204C15.7761 0.12592 15.8304 0.120463 15.8848 0.115668ZM16.6723 11.3257C18.0279 11.1892 19.1411 10.6747 20.0154 9.60698C20.0597 9.55298 20.1026 9.49794 20.1441 9.44185C20.1857 9.38577 20.2258 9.3287 20.2646 9.27066C20.3034 9.21262 20.3407 9.15368 20.3766 9.09385C20.4125 9.03398 20.447 8.97327 20.4799 8.91173C20.5129 8.85018 20.5443 8.78789 20.5742 8.72485C20.6042 8.66177 20.6325 8.59802 20.6594 8.5336C20.6862 8.46914 20.7114 8.40408 20.735 8.33841C20.7587 8.27275 20.7808 8.20654 20.8012 8.13979C20.8216 8.07304 20.8404 8.00583 20.8575 7.93816C20.8747 7.87054 20.8902 7.80252 20.904 7.7341C20.9179 7.66569 20.9301 7.59698 20.9406 7.52798C20.9511 7.45893 20.9599 7.38971 20.967 7.32029C20.9742 7.25083 20.9796 7.18127 20.9834 7.1116C20.9871 7.04189 20.9892 6.97214 20.9895 6.90235C20.9899 6.83252 20.9885 6.76275 20.9855 6.69304C20.9824 6.62329 20.9777 6.55366 20.9713 6.48416C20.9643 6.41037 20.9556 6.33679 20.945 6.26341C20.9344 6.19003 20.9219 6.11696 20.9077 6.0442C20.8935 5.97144 20.8775 5.89908 20.8597 5.82713C20.8418 5.75516 20.8222 5.68369 20.8009 5.6127C20.7795 5.54171 20.7564 5.4713 20.7315 5.40146C20.7067 5.33162 20.6801 5.26243 20.6518 5.19391C20.6235 5.12539 20.5935 5.05762 20.5619 4.99058C20.5302 4.92355 20.4969 4.85734 20.4619 4.79196C20.427 4.72658 20.3905 4.66211 20.3523 4.59854C20.3142 4.53497 20.2745 4.47239 20.2332 4.4108C20.1919 4.3492 20.1492 4.28866 20.1049 4.22919C20.0607 4.16971 20.015 4.11137 19.9679 4.05416C19.9207 3.99696 19.8721 3.94096 19.8222 3.88616C19.7723 3.83137 19.721 3.77784 19.6684 3.72559C19.6158 3.67334 19.562 3.62242 19.5069 3.57284C19.4517 3.52327 19.3954 3.47508 19.3379 3.4283C18.5364 2.77641 17.4074 2.35104 16.3655 2.44379C16.0589 2.46305 15.7509 2.47447 15.449 2.53579C14.5849 2.71136 13.7919 3.247 13.2139 3.90175C12.4089 4.81352 11.9687 6.0004 12.0506 7.21929C12.1292 8.39035 12.6999 9.45885 13.5805 10.2247C13.6333 10.2707 13.6871 10.3155 13.7419 10.359C13.7968 10.4025 13.8527 10.4447 13.9095 10.4855C13.9664 10.5264 14.0242 10.5659 14.0829 10.6041C14.1416 10.6423 14.2011 10.679 14.2615 10.7144C14.322 10.7498 14.3832 10.7837 14.4452 10.8162C14.5072 10.8487 14.57 10.8797 14.6334 10.9093C14.6969 10.9389 14.761 10.9669 14.8258 10.9935C14.8906 11.02 14.956 11.045 15.0219 11.0685C15.0879 11.092 15.1544 11.114 15.2214 11.1344C15.2884 11.1547 15.3558 11.1735 15.4237 11.1907C15.4915 11.2079 15.5597 11.2235 15.6284 11.2375C15.6969 11.2515 15.7658 11.2639 15.835 11.2747C15.9042 11.2855 15.9736 11.2947 16.0432 11.3022C16.1128 11.3097 16.1826 11.3156 16.2525 11.3199C16.3224 11.3241 16.3923 11.3267 16.4623 11.3277C16.5323 11.3287 16.6023 11.328 16.6723 11.3257Z" fill="#F0F0F0"/>
</svg>,
    email: <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_704_75)">
<path d="M1.51898 4.5312C1.68433 4.51019 1.86913 4.52897 2.03673 4.52964L4.97008 4.53074C5.27688 4.53064 5.61585 4.50237 5.91807 4.54621C7.12906 4.72186 7.04793 6.36482 5.97584 6.56004C5.81899 6.58861 4.32568 6.58201 4.1686 6.55761C4.56333 7.043 5.33619 7.6725 5.81077 8.09644L12.6047 14.2023C12.916 14.4795 13.6594 15.2334 14.0018 15.4065C14.4783 15.4336 14.9692 15.4064 15.4476 15.4064L18.7187 15.4065C18.1483 14.7924 17.3851 14.1576 16.7715 13.5572L10.0047 6.98025C9.76137 6.74179 9.48587 6.51456 9.27174 6.24951C8.68993 5.52919 9.20943 4.55682 10.0887 4.52347C10.4717 4.50895 10.8888 4.5312 11.2761 4.53136L30.5671 4.53187C32.0751 4.53062 32.4223 4.49317 32.4078 6.13346L32.4075 16.1184C32.4076 16.5221 32.4324 16.89 32.1299 17.2064C31.76 17.5934 31.0769 17.6071 30.6973 17.2279C30.2961 16.827 30.4011 16.201 30.4019 15.6859L30.4016 7.96826C30.2454 8.07513 30.1069 8.20894 29.9637 8.33257L29.1083 9.07894C28.1648 9.89657 27.2258 10.7231 26.2987 11.5591L21.6448 15.7479C21.4339 15.9383 21.2165 16.1248 21.0321 16.3417C22.3519 17.5949 23.7689 18.7708 25.0994 20.0257C25.6632 20.5209 26.2001 21.0468 26.7577 21.5491L29.0583 23.6466C29.5122 24.0586 29.9769 24.4579 30.4244 24.8773C30.3996 23.9844 30.4239 23.0836 30.4241 22.1899L30.424 21.2135C30.4241 20.9332 30.4126 20.6389 30.4647 20.3626C30.656 19.3476 32.3733 19.4246 32.4137 20.6118C32.4281 21.0341 32.407 21.4661 32.4069 21.8893L32.407 26.4351C32.4071 27.4814 32.2929 28.1541 31.0589 28.1869C29.9476 28.2165 28.8359 28.1742 27.7246 28.191C27.5104 28.1943 27.2816 28.2129 27.0699 28.1763C26.016 27.9944 25.8986 26.4205 26.9368 26.1478C27.2562 26.0639 28.4049 26.1101 28.8004 26.1092C28.6293 25.8881 28.3673 25.7003 28.1601 25.5086C27.5148 24.9117 26.854 24.3311 26.2045 23.7386L20.0604 18.2009C19.7631 17.9309 19.4747 17.6289 19.1515 17.3909C17.7927 17.3588 16.2023 17.3387 14.846 17.3909C15.0559 17.5906 15.2491 17.81 15.4509 18.0179L20.9905 23.7904C21.2882 24.1036 21.6013 24.4038 21.9067 24.7096L22.9612 25.7812C23.3242 26.1486 23.8296 26.4832 23.8982 27.0368C24.0512 28.2717 22.7219 28.1902 21.9479 28.1899L3.28374 28.1896C2.74967 28.1899 2.20786 28.2089 1.67475 28.1748C0.413027 28.0941 0.612528 26.8471 0.613463 25.9552L0.612766 6.76976C0.612386 5.97874 0.384189 4.63037 1.51898 4.5312ZM2.58363 7.89901V24.8264C2.84249 24.6193 3.08441 24.3906 3.33149 24.1698L6.85674 20.9777C7.07143 20.7802 7.30524 20.5954 7.51162 20.3901L11.9839 16.3417C11.7374 16.1292 11.5049 15.9009 11.2632 15.6832L4.32403 9.42988C3.95278 9.10132 2.97739 8.09807 2.58363 7.89901ZM12.9319 18.229C12.4955 18.5894 12.0944 18.9918 11.6729 19.3693L5.50889 24.8949C5.0606 25.2993 4.50505 25.7402 4.09109 26.1566C4.36237 26.1358 4.63799 26.1559 4.91014 26.1564L11.7115 26.1566H20.5279C19.3991 24.9371 18.215 23.7282 17.0668 22.5168L15.6437 21.0376C15.4481 20.8329 13.0187 18.2453 12.9319 18.229ZM12.5077 6.55761C13.3231 7.32682 14.1099 8.12719 14.9101 8.91213L19.4336 13.3046C19.7252 13.5885 20.005 13.8893 20.3114 14.1572C20.563 14.0193 21.1202 13.4564 21.3694 13.2376C22.5628 12.1898 23.7349 11.112 24.9443 10.0829C25.7703 9.32457 26.6222 8.59619 27.4612 7.8525L28.4037 7.02182C28.5846 6.86382 28.7628 6.69027 28.9635 6.55761L14.3338 6.55781C13.7261 6.55782 13.1152 6.5705 12.5077 6.55761Z" fill="#F0F0F0"/>
</g>
<defs>
<clipPath id="clip0_704_75">
<rect width="32" height="32" fill="white" transform="translate(0.5 0.5)"/>
</clipPath>
</defs>
</svg>,
    next: <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.0911 0.515584C16.1823 0.498385 16.2913 0.499595 16.3842 0.50038C16.7206 0.503209 17.1113 0.613673 17.3886 0.815037C17.7733 1.09441 18.1084 1.43778 18.4573 1.76183C18.9714 2.23923 19.4868 2.71048 19.9936 3.19626C21.4703 4.60302 22.9368 6.02117 24.3931 7.45071L29.3845 12.2965C29.8446 12.7398 30.307 13.1807 30.7716 13.619C31.0554 13.887 31.3496 14.149 31.6183 14.4334C32.0545 14.895 32.5093 15.4317 32.4999 16.117C32.4945 16.505 32.3398 16.8366 32.1058 17.132C31.9013 17.3903 31.6628 17.6125 31.4313 17.8437L30.6399 18.6474L27.5064 21.8496L17.8822 31.7077C17.3934 32.2013 16.8342 32.5139 16.1366 32.4995C16.105 32.4987 16.0734 32.4971 16.0419 32.4947C16.0104 32.4922 15.979 32.489 15.9476 32.485C15.9163 32.481 15.885 32.4761 15.8539 32.4705C15.8227 32.4648 15.7918 32.4585 15.7609 32.4513C15.7301 32.4441 15.6995 32.4361 15.669 32.4273C15.6386 32.4186 15.6083 32.4091 15.5784 32.3988C15.5483 32.3885 15.5186 32.3774 15.4891 32.3656C15.4597 32.3538 15.4305 32.3412 15.4016 32.3279C15.3727 32.3147 15.3441 32.3007 15.3159 32.2859C15.2877 32.2712 15.2598 32.2557 15.2323 32.2395C15.2048 32.2233 15.1777 32.2065 15.151 32.1889C15.1243 32.1714 15.0981 32.1532 15.0722 32.1343C15.0464 32.1155 15.021 32.0959 14.9961 32.0757C14.9712 32.0555 14.9467 32.0347 14.9228 32.0133C14.8989 31.9919 14.8754 31.9699 14.8526 31.9473C14.8297 31.9247 14.8073 31.9015 14.7855 31.8778C14.5434 31.6157 14.4134 31.3195 14.3467 30.9656C14.2623 30.5178 14.2773 30.0532 14.2772 29.5989L14.2773 28.2452C14.2776 26.8473 14.2555 25.4453 14.2803 24.0479C13.6485 24.0332 13.0377 24.0037 12.5578 23.5194C12.2132 23.1716 12.0265 22.6666 12.0215 22.1712C12.0168 21.7011 12.1782 21.2362 12.4987 20.9007C13.1328 20.2366 14.1235 20.3229 14.9514 20.3327C15.3013 20.3369 15.6508 20.3261 16.0006 20.327C16.5273 20.3284 16.986 20.4325 17.3642 20.8344C17.6011 21.0862 17.7262 21.3711 17.7944 21.7128C17.9337 22.4097 17.8502 23.3427 17.8448 24.0633L17.8498 26.7657C18.0903 26.5474 18.3115 26.2974 18.5444 26.069C19.4092 25.205 20.269 24.3358 21.1238 23.4612C22.8426 21.7271 24.5204 19.9494 26.2471 18.2233L27.5782 16.8992C27.8291 16.6529 28.0816 16.3861 28.3543 16.1669C28.0597 15.9123 27.7918 15.6134 27.5133 15.3391L25.9536 13.8179L20.6985 8.69324L18.9136 6.95405C18.56 6.60936 18.215 6.25146 17.8464 5.92445C17.8319 6.39831 17.8449 6.87603 17.8459 7.35029L17.8467 9.32575C17.8518 9.92588 17.9074 10.5749 17.808 11.1676C17.7545 11.4865 17.645 11.797 17.4304 12.0379C16.8075 12.7371 15.6853 12.4574 14.8799 12.4001C14.4338 12.3712 13.9874 12.3648 13.5407 12.3808C10.0482 12.5139 6.54174 13.8277 4.10262 16.4903C3.77656 16.8461 3.46737 17.2449 3.2045 17.6538C3.01468 17.9491 2.85286 18.2827 2.61717 18.5423C2.41084 18.7695 2.18544 18.8861 1.88239 18.8938C1.49592 18.9036 1.13388 18.7242 0.85854 18.4516C0.623998 18.2194 0.506 17.935 0.500255 17.5978C0.492611 17.149 0.657823 16.6971 0.820219 16.2878C0.881456 16.1318 0.94625 15.9774 1.0146 15.8247C1.08295 15.6719 1.15478 15.5209 1.23009 15.3717C1.30541 15.2225 1.38411 15.0753 1.46622 14.93C1.54834 14.7847 1.63373 14.6416 1.72238 14.5005C1.81109 14.3595 1.903 14.2208 1.99811 14.0843C2.09323 13.9478 2.19142 13.8138 2.29269 13.6822C2.39396 13.5506 2.49821 13.4216 2.60543 13.2951C2.71266 13.1687 2.82274 13.0451 2.93566 12.9241C5.03154 10.6937 7.92244 9.30312 10.8674 8.80788C11.996 8.61813 13.1364 8.56242 14.2779 8.54781C14.3056 7.18678 14.2833 5.81869 14.2786 4.45711C14.2761 3.75936 14.216 3.04577 14.3129 2.35271C14.3644 1.98405 14.4739 1.58295 14.6884 1.27827C15.0252 0.79996 15.5463 0.604425 16.0911 0.515584Z" fill="#1A1A1A"/>
</svg>,
  };

  // --- GraphQL Mutations ---
  // --- Updated GraphQL Mutations ---
  const [registerUser, { loading: registerLoading, error: registerError }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      console.log('Registration step successful (user created, email sent):', data);
      // User created, email sent (or attempted). Move to code verification.
      setStep(4);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Registration mutation error:', error);
      // Handle specific errors like email already exists
      if (error.message.includes('already exists')) { // Basic check
         setErrors(prev => ({ ...prev, email: 'This email is already registered.', api: '' }));
      } else {
         setErrors(prev => ({ ...prev, api: error.message || 'Registration failed. Please try again.' }));
      }
      setIsLoading(false);
    }
  });

  // Removed unused sendVerificationCode hook

  // Removed useMutation hook for verifyEmail (This section confirms the hook is removed)

  const [resendCode, { loading: resendLoading, error: resendError }] = useMutation(RESEND_VERIFICATION_CODE_MUTATION, {
      onCompleted: (data) => {
          if (data.resendVerificationCode) {
              console.log('Resend code request successful');
              setErrors(prev => ({ ...prev, api: 'A new confirmation code has been sent to your email.' })); // Provide feedback
          } else {
              // This might happen if the backend returns false for some reason (e.g., rate limiting)
              console.warn('Resend code request returned false');
              setErrors(prev => ({ ...prev, api: 'Failed to resend code. Please try again later.' }));
          }
          setIsLoading(false);
      },
      onError: (error) => {
          console.error('Resend code mutation error:', error);
          setErrors(prev => ({ ...prev, api: error.message || 'Failed to resend code.' }));
          setIsLoading(false);
      }
  });

  // --- Validation Functions ---
  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    // Add more password rules if needed (uppercase, number, symbol)
    return '';
  };
  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name is required.';
    if (name.length < 2) return 'Name must be at least 2 characters long.';
    if (name.length > 50) return 'Name must be less than 50 characters long.';
    if (!/^[A-Za-z\s'-]+$/.test(name.trim())) return 'Name contains invalid characters.'; // Allow letters, spaces, hyphens, apostrophes
    return '';
  };
  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address.';
    return '';
  };
   const validateConfirmationCode = (code: string): string => {
    if (!code) return 'Confirmation code is required.';
    if (code.length !== 6) return 'Code must be 6 digits long.';
    if (!/^\d{6}$/.test(code)) return 'Code must contain only digits.';
    return '';
  };
  // --- End Validation Functions ---


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmationCode') {
      setConfirmationCode(value.replace(/[^0-9]/g, '').slice(0, 6)); // Allow only digits, max 6
      setErrors(prev => ({ ...prev, confirmationCode: '', api: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear specific field error on input change
      setErrors(prev => ({ ...prev, [name]: '', api: '' }));
    }
    setErrors(prev => ({ ...prev, api: '' })); // Clear general API error too
  };

  const handleNextStep = async () => {
    setErrors(prev => ({ ...prev, api: '' })); // Clear previous API errors
    let isValid = true;
    let validationError = '';

    if (step === 1) {
      validationError = validatePassword(formData.password);
      if (validationError) {
        setErrors(prev => ({ ...prev, password: validationError }));
        isValid = false;
      }
    } else if (step === 2) {
      validationError = validateName(formData.name);
      if (validationError) {
        setErrors(prev => ({ ...prev, name: validationError }));
        isValid = false;
      }
    } else if (step === 3) {
      validationError = validateEmail(formData.email);
      if (validationError) {
        setErrors(prev => ({ ...prev, email: validationError }));
        isValid = false;
      }
    }

    if (!isValid) return; // Stop if validation failed

    setIsLoading(true);

    if (step === 3) {
      // Trigger registration mutation (sends email, password, name)
      try {
        console.log('Triggering registration with:', formData);
        await registerUser({
          variables: {
            registerInput: {
              name: formData.name.trim(), // Trim name before sending
              email: formData.email.trim(), // Trim email
              password: formData.password, // Password validation already done
            }
          }
        });
        // Success handled by onCompleted hook (sets step to 4)
      } catch (err) {
        // Error handled by onError hook
        console.error("Caught registration error in handleNextStep:", err); // Keep for debugging
        setIsLoading(false); // Ensure loading is stopped on catch
      }
    } else {
      // Just move to the next step for steps 1 and 2
      setStep(prev => prev + 1);
      setIsLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    setErrors(prev => ({ ...prev, api: '' })); // Clear previous API errors
    const codeError = validateConfirmationCode(confirmationCode);
    if (codeError) {
      setErrors(prev => ({ ...prev, confirmationCode: codeError }));
      return;
    }

    setIsLoading(true);
    // Trigger the verifyEmail mutation
    try {
      console.log('Triggering email verification with:', { email: formData.email, code: confirmationCode });

      // --- Новый подход: Явная проверка перед отправкой ---
      if (typeof confirmationCode !== 'string' || confirmationCode.length !== 6) {
        console.error('CRITICAL FRONTEND ERROR: confirmationCode is invalid just before sending!', {
          value: confirmationCode,
          type: typeof confirmationCode,
          length: confirmationCode?.length
        });
        setErrors(prev => ({ ...prev, confirmationCode: 'Invalid code format. Please re-enter.', api: '' }));
        setIsLoading(false); // Остановить индикатор загрузки
        return; // Прервать выполнение
      }
      // --- Конец проверки ---

      const variablesToVerify = {
        email: formData.email.trim(),
        code: confirmationCode, // Теперь мы уверены, что это 6-значная строка
      };
      console.log('Variables being sent to verifyEmail:', variablesToVerify);

      // --- Новый подход: Используем client.mutate напрямую ---
      const { data, errors: mutationErrors } = await client.mutate({
          mutation: VERIFY_EMAIL,
          variables: variablesToVerify,
          // Важно: Указываем политику обработки ошибок, чтобы catch ниже сработал
          // для GraphQL ошибок (а не только сетевых)
          errorPolicy: 'all', // или 'none' если хотим полагаться только на try/catch
      });

      // Обработка GraphQL ошибок (если errorPolicy: 'all')
      if (mutationErrors && mutationErrors.length > 0) {
          console.error('Email verification mutation GraphQL errors:', mutationErrors);
          const error = mutationErrors[0]; // Берем первую ошибку для отображения
          if (error.message.includes('Invalid') || error.message.includes('Неверный')) {
             setErrors(prev => ({ ...prev, confirmationCode: 'Invalid confirmation code.', api: '' }));
          } else if (error.message.includes('expired') || error.message.includes('истек')) {
             setErrors(prev => ({ ...prev, confirmationCode: 'Confirmation code has expired. Please request a new one.', api: '' }));
          } else {
             // Проверяем специфичную ошибку "Variable "$code" of required type "String!" was not provided."
             if (error.message.includes('Variable "$code" of required type "String!" was not provided')) {
                console.error("DETECTED 'Variable code not provided' error despite sending it. Check network payload/Apollo Client config.");
                setErrors(prev => ({ ...prev, api: 'Internal error: Verification code not sent correctly. Please try again or contact support.' }));
             } else {
                setErrors(prev => ({ ...prev, api: error.message || 'Email verification failed.' }));
             }
          }
          setIsLoading(false);
          return; // Прерываем, так как есть ошибка GraphQL
      }

      // Обработка успешного ответа (если нет GraphQL ошибок)
      if (data?.verifyEmail?.access_token) {
        console.log('Email verified successfully (direct mutate):', data);
        localStorage.setItem('authToken', data.verifyEmail.access_token);
        console.log('Auth token stored.');
        router.push('/chat');
        // setIsLoading(false) не нужен при редиректе
      } else {
        // Эта ветка не должна сработать при успешной мутации, но оставим для защиты
        console.error('Verification successful but no token received (direct mutate).');
        setErrors(prev => ({ ...prev, api: 'Verification succeeded but login failed. Please try logging in manually.' }));
        setIsLoading(false);
      }
      // --- Конец использования client.mutate ---

    } catch (err: any) {
      // Обработка сетевых или других непредвиденных ошибок
      console.error('Code verification network/unexpected error caught in component:', err);
      setErrors(prev => ({ ...prev, api: err.message || 'An unexpected error occurred during verification.' }));
      setIsLoading(false); // Убедимся, что загрузка выключена при любой ошибке
    } finally {
      // setIsLoading(false); // Убрано отсюда, управляется в блоках try/catch
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setErrors(prev => ({ ...prev, api: '' })); // Clear previous API errors
    // Trigger the resendVerificationCode mutation
    try {
        console.log('Triggering resend code for:', formData.email);
        await resendCode({
            variables: {
                email: formData.email.trim(),
            }
        });
        // Feedback/loading state handled by the hook
    } catch (err: any) {
        console.error('Resend code error:', err);
        setErrors(prev => ({ ...prev, api: err.message || 'Failed to resend code.' }));
    } finally {
        setIsLoading(false);
    }
  };


  const renderStepContent = () => {
    switch (step) {
      case 1: // Password
        return (
          <div className="w-full max-w-xs">
            <label className="block text-textSecondary-dark text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {icons.password} {/* Render SVG component directly */}
              </span>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`shadow appearance-none border rounded w-full py-2 px-3 pl-10 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 placeholder-gray-400 text-white ${errors.password ? 'border-red-500' : 'border-gray-600'}`}
                required
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
              />
            </div>
             {errors.password && <p id="password-error" className="text-red-500 text-xs italic mt-1">{errors.password}</p>}
             {!errors.password && <p className="mt-1 text-xs text-textSecondary-light dark:text-textSecondary-dark">Password must be at least 8 characters long</p>}
          </div>
        );
      case 2: // Name
        return (
          <div className="w-full max-w-xs">
            <label className="block text-textSecondary-dark text-sm font-bold mb-2" htmlFor="name">
              Your name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {icons.name} {/* Render SVG component directly */}
              </span>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className={`shadow appearance-none border rounded w-full py-2 px-3 pl-10 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 placeholder-gray-400 text-white ${errors.name ? 'border-red-500' : 'border-gray-600'}`}
                required
                aria-invalid={!!errors.name}
                aria-describedby="name-error"
              />
            </div>
             {errors.name && <p id="name-error" className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
          </div>
        );
      case 3: // Email
        return (
          <div className="w-full max-w-xs">
            <label className="block text-textSecondary-dark text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {icons.email} {/* Render SVG component directly */}
              </span>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                 className={`shadow appearance-none border rounded w-full py-2 px-3 pl-10 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 placeholder-gray-400 text-white ${errors.email ? 'border-red-500' : 'border-gray-600'}`}
                required
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
              />
            </div>
             {errors.email && <p id="email-error" className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
          </div>
        );
      case 4: // Confirmation Code
        return (
          <div className="w-full max-w-xs text-center">
             <p className="text-textSecondary-dark mb-4">
               Welcome, {formData.name}! To complete the registration process, please enter the code we sent to {formData.email}.
             </p>
            <label className="block text-textSecondary-dark text-sm font-bold mb-2" htmlFor="confirmationCode">
              Confirmation Code
            </label>
            {/* Basic 8-digit code input */}
            <input
              type="text"
              name="confirmationCode"
              id="confirmationCode"
              value={confirmationCode}
              onChange={handleInputChange}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 placeholder-gray-400 text-white text-center tracking-[.5em] ${errors.confirmationCode ? 'border-red-500' : 'border-gray-600'}`} // Wider tracking for digit spacing
              required
              aria-invalid={!!errors.confirmationCode}
              aria-describedby="code-error"
            />
             {errors.confirmationCode && <p id="code-error" className="text-red-500 text-xs italic mt-1">{errors.confirmationCode}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  // Determine if the next/confirm button should be disabled based on current step's validity
  const isStepDataValid = () => {
    if (step === 1) return !validatePassword(formData.password);
    if (step === 2) return !validateName(formData.name);
    if (step === 3) return !validateEmail(formData.email);
    if (step === 4) return !validateConfirmationCode(confirmationCode);
    return false;
  };

  return (
     <>
      <NextSeo
        title="Register - BrainMessenger"
        description="Create your BrainMessenger account"
      />
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark text-textPrimary-dark p-4">
        <img src={icons.logo} alt="BrainMessenger Logo" className="w-24 h-24 mb-8" />

        <div className="text-center mb-8">
          <p className="text-textSecondary-dark">Step {step} of 4</p>
          {/* TODO: Add step-specific titles if needed */}
        </div>

        <form className="w-full max-w-xs flex flex-col items-center" onSubmit={(e) => e.preventDefault()}>
          {renderStepContent()}

          {/* General API Error Display */}
          {errors.api && <p className="text-red-500 text-xs italic mt-4 text-center">{errors.api}</p>}
          {/* Display GraphQL error if no specific API error is set */}
          {/* Combined loading state check */}
          {/* Используем общее состояние isLoading */}
          {(isLoading || registerLoading || resendLoading) && <p className="text-blue-400 text-xs italic mt-4 text-center">Loading...</p>}

          {/* Display GraphQL errors if no specific API error is set (verifyError больше не существует) */}
          {registerError && !errors.api && !errors.email && <p className="text-red-500 text-xs italic mt-4 text-center">{registerError.message || 'An unexpected registration error occurred.'}</p>}
          {/* Ошибки верификации теперь обрабатываются и выводятся в errors.api или errors.confirmationCode */}
          {resendError && !errors.api && <p className="text-red-500 text-xs italic mt-4 text-center">{resendError.message || 'An unexpected error occurred while resending the code.'}</p>}


          {step < 4 && (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isLoading || registerLoading || resendLoading || !isStepDataValid()} // Учитываем все состояния загрузки
              className="mt-6 bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to p-2 rounded-full hover:scale-110 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {icons.next} {/* Render SVG component directly */}
            </button>
          )}

          {step === 4 && (
            <>
              <button
                type="button"
                onClick={handleConfirmCode}
                disabled={isLoading || registerLoading || resendLoading || !isStepDataValid()} // Учитываем все состояния загрузки
                className="mt-6 bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to text-background-dark py-2 px-6 rounded-lg shadow-md hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Confirming...' : 'Confirm'} {/* Используем общее состояние isLoading для кнопки Confirm */}
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading || registerLoading || resendLoading} // Учитываем все состояния загрузки
                className="mt-2 text-sm text-secondary hover:underline disabled:opacity-50"
              >
                Get the code again
              </button>
            </>
          )}

          {step < 4 && (
            <div className="mt-4 text-sm text-textSecondary-dark">
              Already have an Account? <a href="/login" className="text-secondary hover:underline">Login</a>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default RegistrationPage;